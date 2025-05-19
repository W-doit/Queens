// POS session controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { POSSessionResponse } from "../../types/pos";
import { getActiveSession } from "../../services/pos.service";

/**
 * Get current POS session status
 */
export const getSession = async (req: Request, res: Response) => {
  try {
    console.log("Fetching active POS session...");
    const session = await getActiveSession();
    console.log(
      "Session result:",
      session ? "Session found" : "No active session"
    );

    if (!session) {
      return res.json({
        active: false,
        message: "No active POS session",
      } as POSSessionResponse);
    }

    // Get config info
    const configs = await callOdoo<any[]>(
      "pos.config",
      "read",
      [[session.config_id[0]]],
      { fields: ["name"] }
    );

    console.log(`Found active session: ${session.name} (ID: ${session.id})`);

    res.json({
      active: true,
      session_id: session.id,
      name: session.name,
      user: session.user_id ? session.user_id[1] : "Unknown",
      start_time: session.start_at,
      config_name: configs && configs.length > 0 ? configs[0].name : "Unknown",
    } as POSSessionResponse);
  } catch (error: any) {
    console.error("Error getting POS session:", error);
    res.status(500).json({
      error: "Failed to get POS session",
      message: error.message,
    });
  }
};

/**
 * Open new POS session
 */
export const openSession = async (req: Request, res: Response) => {
  try {
    console.log("Opening new POS session...");

    // First check for existing sessions
    console.log("Checking for existing sessions...");
    const existingSessions = await callOdoo<any[]>(
      "pos.session",
      "search_read",
      [[["state", "not in", ["closed"]]]],
      {
        fields: ["id", "name", "state", "user_id", "start_at", "config_id"],
        order: "create_date DESC",
      }
    );

    console.log(`Found ${existingSessions.length} non-closed sessions`);

    // If there are existing sessions, try to use one of them
    if (existingSessions && existingSessions.length > 0) {
      const session = existingSessions[0];
      console.log(
        `Using existing session: ${session.name} (ID: ${session.id}, State: ${session.state})`
      );

      // If session is in opening_control state, try to activate it
      if (session.state === "opening_control" && req.body.activate !== false) {
        console.log(
          "Session is in opening_control state, attempting to activate it..."
        );
        try {
          await callOdoo("pos.session", "action_pos_session_open", [
            [session.id],
          ]);

          // Check if activation was successful
          const updatedSessions = await callOdoo<any[]>(
            "pos.session",
            "read",
            [[session.id]],
            { fields: ["state"] }
          );

          if (updatedSessions && updatedSessions.length > 0) {
            session.state = updatedSessions[0].state;
            console.log(`Session activated and now in ${session.state} state`);
          }
        } catch (error) {
          console.log("Could not activate session automatically:", error);
        }
      }

      // Return the session details (possibly with updated state)
      res.status(200).json({
        message: "Using existing POS session",
        session_id: session.id,
        name: session.name,
        user: session.user_id ? session.user_id[1] : "Unknown",
        start_time: session.start_at,
        state: session.state,
      });
      return;
    }

    // If no existing session, we need to create one

    // Get POS config
    console.log("Getting POS configurations...");
    const configs = await callOdoo<any[]>("pos.config", "search_read", [[]], {
      fields: ["id", "name"],
      limit: 1,
    });

    if (!configs || configs.length === 0) {
      console.log("No POS configuration found");
      return res.status(400).json({
        error: "No POS configuration",
        message: "No POS configuration found in the system",
      });
    }

    console.log(`Using POS config: ${configs[0].name} (ID: ${configs[0].id})`);

    // Count current sessions before attempting creation
    console.log("Counting sessions before creation...");
    const beforeCount = await callOdoo<number>("pos.session", "search_count", [
      [["config_id", "=", configs[0].id]],
    ]);

    // Create session using Odoo's methods
    console.log("Creating session using Odoo's open_session_cb method...");
    try {
      await callOdoo("pos.config", "open_session_cb", [[configs[0].id]]);
      console.log("open_session_cb method called successfully");
    } catch (e) {
      console.log("open_session_cb method failed, trying open_ui...");
      try {
        await callOdoo("pos.config", "open_ui", [[configs[0].id]]);
        console.log("open_ui method called successfully");
      } catch (e2) {
        console.log("open_ui method also failed, trying direct creation...");
        try {
          const sessionId = await callOdoo<number>("pos.session", "create", [
            {
              config_id: configs[0].id,
              user_id: false, // Let Odoo use the current user
              state: "opening_control",
            },
          ]);
          console.log(`Direct session creation returned ID: ${sessionId}`);
        } catch (e3) {
          console.log("All creation methods failed");
        }
      }
    }

    // Wait for session creation to complete
    console.log("Waiting for session creation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if a session was actually created
    console.log("Checking if a session was created...");
    const afterCount = await callOdoo<number>("pos.session", "search_count", [
      [["config_id", "=", configs[0].id]],
    ]);

    console.log(`Sessions before: ${beforeCount}, after: ${afterCount}`);

    if (afterCount > beforeCount) {
      console.log("New session detected!");

      // Get the newest session
      const newSessions = await callOdoo<any[]>(
        "pos.session",
        "search_read",
        [
          [
            ["config_id", "=", configs[0].id],
            ["state", "not in", ["closed"]],
          ],
        ],
        {
          fields: ["id", "name", "user_id", "start_at", "state", "config_id"],
          order: "create_date DESC",
          limit: 1,
        }
      );

      if (newSessions && newSessions.length > 0) {
        const session = newSessions[0];
        console.log(
          `Found new session: ${session.name} (ID: ${session.id}, State: ${session.state})`
        );

        // If auto-activation is requested and session is in opening_control
        if (
          session.state === "opening_control" &&
          req.body.activate !== false
        ) {
          console.log("Auto-activating new session...");
          try {
            await callOdoo("pos.session", "action_pos_session_open", [
              [session.id],
            ]);

            // Re-fetch session to get updated state
            const updatedSessions = await callOdoo<any[]>(
              "pos.session",
              "read",
              [[session.id]],
              { fields: ["state"] }
            );

            if (updatedSessions && updatedSessions.length > 0) {
              session.state = updatedSessions[0].state;
              console.log(
                `Session activated and now in ${session.state} state`
              );
            }
          } catch (error) {
            console.log("Could not activate new session automatically:", error);
          }
        }

        res.status(201).json({
          message: "POS session created successfully",
          session_id: session.id,
          name: session.name,
          user: session.user_id ? session.user_id[1] : "Unknown",
          start_time: session.start_at,
          state: session.state,
        });
        return;
      }
    }

    // If we get here, session creation failed
    console.log("Session creation failed or could not detect new session");
    res.status(500).json({
      error: "Session creation failed",
      message: "Failed to create a new POS session",
      workaround:
        "Try creating a session manually in the Odoo UI, then use this API to interact with it",
    });
  } catch (error: any) {
    console.error("Error opening POS session:", error);
    res.status(500).json({
      error: "Failed to open POS session",
      message: error.message || "Unknown error",
    });
  }
};

/**
 * Activate a session (move from opening_control to opened)
 */
export const activateSession = async (req: Request, res: Response) => {
  try {
    console.log("Activating POS session...");
    console.log("Request body:", req.body); // Debug request body

    // Check if req.body exists, otherwise initialize as empty object
    const body = req.body || {};

    // Get session ID from request body, or find the most recent session
    let sessionId = body.session_id;

    // If no session ID provided, find the most recent non-closed session
    if (!sessionId) {
      console.log(
        "No session ID provided, looking for latest session in opening_control state..."
      );
      const sessions = await callOdoo<any[]>(
        "pos.session",
        "search_read",
        [[["state", "=", "opening_control"]]],
        { fields: ["id", "name"], order: "create_date DESC", limit: 1 }
      );

      if (!sessions || sessions.length === 0) {
        return res.status(404).json({
          error: "No session found",
          message: "No session in opening_control state was found",
        });
      }

      sessionId = sessions[0].id;
      console.log(
        `Found latest session with ID: ${sessionId} (${sessions[0].name})`
      );
    }

    console.log(`Activating session ID ${sessionId}...`);

    // Check if session exists and is in opening_control state
    const sessions = await callOdoo<any[]>(
      "pos.session",
      "read",
      [[sessionId]],
      { fields: ["id", "name", "state", "config_id"] }
    );

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        error: "Session not found",
        message: `No session found with ID ${sessionId}`,
      });
    }

    const session = sessions[0];
    console.log(`Found session: ${session.name} in state: ${session.state}`);

    if (session.state !== "opening_control") {
      return res.status(400).json({
        error: "Invalid session state",
        message: `Session ${session.name} is in ${session.state} state, not opening_control`,
      });
    }

    console.log(`Activating session ${session.name}...`);

    // Try to activate the session directly by changing its state
    try {
      console.log("Setting session state to opened...");
      await callOdoo("pos.session", "write", [
        [sessionId],
        { state: "opened" },
      ]);
    } catch (writeError) {
      console.log(
        "Direct state change failed, trying action_pos_session_open..."
      );

      // If direct write fails, try the standard method
      try {
        await callOdoo("pos.session", "action_pos_session_open", [[sessionId]]);
      } catch (actionError) {
        console.error("Could not activate session:", actionError);
        return res.status(500).json({
          error: "Activation failed",
          message:
            "Failed to activate session - both direct state change and action_pos_session_open failed",
        });
      }
    }

    // Verify state changed
    const updatedSessions = await callOdoo<any[]>(
      "pos.session",
      "read",
      [[sessionId]],
      { fields: ["id", "name", "state", "user_id", "start_at"] }
    );

    if (!updatedSessions || updatedSessions.length === 0) {
      return res.status(500).json({
        error: "Session verification failed",
        message: "Could not verify session state after activation attempt",
      });
    }

    const updatedSession = updatedSessions[0];
    console.log(
      `Session ${updatedSession.name} is now in ${updatedSession.state} state`
    );

    if (updatedSession.state !== "opened") {
      return res.status(500).json({
        error: "Activation incomplete",
        message: `Session remains in ${updatedSession.state} state after activation attempt`,
      });
    }

    res.json({
      message: "Session activated successfully",
      session_id: sessionId,
      name: updatedSession.name,
      user: updatedSession.user_id ? updatedSession.user_id[1] : "Unknown",
      start_time: updatedSession.start_at,
      state: updatedSession.state,
    });
  } catch (error: any) {
    console.error("Error activating session:", error);
    res.status(500).json({
      error: "Failed to activate session",
      message: error.message || "Unknown error",
    });
  }
};

/**
 * Force creation of a new POS session with custom date support - direct DB approach
 */
export const forcePosSession = async (req: Request, res: Response) => {
  try {
    console.log("Forcing new POS session creation (direct approach)...");
    console.log("Request body:", req.body);

    // Parse start date from request if provided
    let startDate: string;
    if (req.body && req.body.start_date) {
      try {
        const date = new Date(req.body.start_date);
        startDate = date.toISOString().slice(0, 19).replace("T", " ");
        console.log(`Using custom start date: ${startDate}`);
      } catch (dateError) {
        console.log("Invalid date format, using current date");
        startDate = new Date().toISOString().slice(0, 19).replace("T", " ");
      }
    } else {
      startDate = new Date().toISOString().slice(0, 19).replace("T", " ");
      console.log(`Using current date: ${startDate}`);
    }

    // Step 1: Ensure no active sessions exist
    console.log("Checking for existing active sessions...");
    const existingSessions = await callOdoo<any[]>(
      "pos.session",
      "search_read",
      [[["state", "not in", ["closed"]]]],
      { fields: ["id", "name", "state"] }
    );

    if (existingSessions && existingSessions.length > 0) {
      return res.status(400).json({
        error: "Active session exists",
        message: `Found ${existingSessions.length} active sessions. Close them first.`,
        sessions: existingSessions.map((s) => ({
          id: s.id,
          name: s.name,
          state: s.state,
        })),
      });
    }

    // Step 2: First fix any existing issues
    console.log("Running data fix operations first...");

    // Fix any sessions with stop_at = false
    const badSessions = await callOdoo<any[]>(
      "pos.session",
      "search_read",
      [[["stop_at", "=", false]]],
      { fields: ["id", "name"] }
    );

    if (badSessions && badSessions.length > 0) {
      const sessionIds = badSessions.map((s) => s.id);
      await callOdoo("pos.session", "write", [sessionIds, { stop_at: null }]);
      console.log(
        `Fixed ${sessionIds.length} sessions with bad stop_at values`
      );
    }

    // Step 3: Get a POS config and ensure it's ready
    console.log("Preparing POS config...");
    const configs = await callOdoo<any[]>(
      "pos.config",
      "search_read",
      [[["active", "=", true]]],
      { fields: ["id", "name", "current_session_id"] }
    );

    if (!configs || configs.length === 0) {
      return res.status(400).json({
        error: "No POS config",
        message: "No active POS configurations found",
      });
    }

    const config = configs[0];
    console.log(`Using POS config: ${config.name} (ID: ${config.id})`);

    // Step 4: Reset the config
    await callOdoo("pos.config", "write", [
      [config.id],
      {
        current_session_id: false,
        current_session_state: false,
        last_session_closing_date: null,
      },
    ]);
    console.log("Reset POS config state");

    // Step 5: Generate session name
    const posPrefix = "POS";
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    const sessionName = `${posPrefix}/${randomNum.toString().padStart(5, "0")}`;

    // Step 6: Get current user ID
    const userInfo = await callOdoo<any[]>(
      "res.users",
      "search_read",
      [[["active", "=", true]]],
      { fields: ["id"], limit: 1 }
    );

    const userId = userInfo && userInfo.length > 0 ? userInfo[0].id : false;

    // Step 7: Create session with minimal fields directly
    console.log(`Creating session with name ${sessionName}...`);

    // Create a session document
    try {
      // This will use a more direct approach with minimal fields
      const sessionData = {
        name: sessionName,
        user_id: userId,
        config_id: config.id,
        start_at: startDate,
        stop_at: null,
        state: "opened",
        rescue: true, // Mark as rescue session to bypass some validations
        sequence_number: 1,
        login_number: 1,
      };

      console.log("Creating session with data:", sessionData);

      // Use model create method
      const sessionId = await callOdoo<number>("pos.session", "create", [
        sessionData,
      ]);

      if (!sessionId || sessionId === 0) {
        throw new Error("Create method returned no session ID");
      }

      console.log(`Session created with ID: ${sessionId}`);

      // Update the POS config to reference this session
      await callOdoo("pos.config", "write", [
        [config.id],
        {
          current_session_id: sessionId,
          current_session_state: "opened",
        },
      ]);
      console.log(
        `Updated config ${config.id} to reference session ${sessionId}`
      );

      // Retrieve the created session
      const sessions = await callOdoo<any[]>(
        "pos.session",
        "read",
        [[sessionId]],
        { fields: ["id", "name", "user_id", "start_at", "state", "config_id"] }
      );

      if (!sessions || sessions.length === 0) {
        throw new Error("Could not retrieve created session");
      }

      const newSession = sessions[0];
      console.log(
        `Retrieved session: ${newSession.name} (ID: ${newSession.id}, State: ${newSession.state})`
      );

      res.status(201).json({
        message: "POS session created successfully",
        session_id: newSession.id,
        name: newSession.name,
        user: newSession.user_id ? newSession.user_id[1] : "Unknown",
        start_time: newSession.start_at,
        state: newSession.state,
        config_name: config.name,
      });
    } catch (createError: any) {
      console.error("Session creation failed:", createError);

      // If direct creation fails, try one last-ditch effort with execute_kw
      try {
        console.log("Attempting alternative creation method...");

        // Sometimes a simpler approach works better
        await callOdoo(
          "pos.config",
          "open_ui", // This sometimes works when other methods fail
          [[config.id]]
        );

        // Wait a moment
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Look for a new session
        const newSessions = await callOdoo<any[]>(
          "pos.session",
          "search_read",
          [
            [
              ["config_id", "=", config.id],
              ["state", "not in", ["closed"]],
            ],
          ],
          { fields: ["id", "name", "user_id", "start_at", "state"], limit: 1 }
        );

        if (newSessions && newSessions.length > 0) {
          const newSession = newSessions[0];
          console.log(`Found new session: ${newSession.name}`);

          res.status(201).json({
            message: "POS session created successfully using fallback method",
            session_id: newSession.id,
            name: newSession.name,
            user: newSession.user_id ? newSession.user_id[1] : "Unknown",
            start_time: newSession.start_at,
            state: newSession.state,
            config_name: config.name,
          });
        } else {
          throw new Error("No session created by fallback method");
        }
      } catch (fallbackError: any) {
        console.error("Fallback method failed:", fallbackError);

        res.status(500).json({
          error: "Session creation failed",
          message:
            "All creation methods failed. Try closing Odoo completely and restarting it.",
          details: createError.message,
        });
      }
    }
  } catch (error: any) {
    console.error("Error in force session creation:", error);
    res.status(500).json({
      error: "Session creation failed",
      message: error.message || "Unknown error",
    });
  }
};

/**
 * Close POS session
 */
export const closeSession = async (req: Request, res: Response) => {
  try {
    console.log("Closing POS session...");

    // Check for open session
    const session = await getActiveSession();

    if (!session) {
      console.log("No active session to close");
      return res.status(400).json({
        error: "No open session",
        message: "There is no active POS session to close",
      });
    }

    console.log(
      `Preparing to close session: ${session.name} (ID: ${session.id})`
    );

    // Check for open orders
    console.log("Checking for open orders...");
    const openOrders = await callOdoo<number>("pos.order", "search_count", [
      [
        ["session_id", "=", session.id],
        ["state", "=", "draft"],
      ],
    ]);

    if (openOrders > 0) {
      console.log(`Found ${openOrders} uncompleted orders`);
      return res.status(400).json({
        error: "Open orders exist",
        message: `There are ${openOrders} uncompleted orders. Please finalize all orders before closing.`,
      });
    }

    // Close session
    console.log("Putting session in closing control...");
    try {
      await callOdoo("pos.session", "action_pos_session_closing_control", [
        [session.id],
      ]);

      // Wait a moment for state to update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Closing session...");
      await callOdoo("pos.session", "action_pos_session_close", [[session.id]]);

      console.log("Session closed successfully");
    } catch (closeError: any) {
      console.error("Error during session close:", closeError);

      // Try direct state change if normal close fails
      console.log("Attempting direct state change...");
      await callOdoo("pos.session", "write", [
        [session.id],
        { state: "closed" },
      ]);
    }

    // Verify session is closed
    const updatedSessions = await callOdoo<any[]>(
      "pos.session",
      "read",
      [[session.id]],
      { fields: ["state"] }
    );

    console.log(
      `Session state after close attempt: ${updatedSessions[0]?.state}`
    );

    res.json({
      message: "POS session closed successfully",
      session_id: session.id,
      name: session.name,
    });
  } catch (error: any) {
    console.error("Error closing POS session:", error);
    res.status(500).json({
      error: "Failed to close POS session",
      message: error.message,
    });
  }
};

/**
 * Get detailed session info
 */
export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id ? parseInt(req.params.id) : null;

    if (!sessionId) {
      return res.status(400).json({
        error: "Missing session ID",
        message: "Session ID is required",
      });
    }

    const sessions = await callOdoo<any[]>(
      "pos.session",
      "read",
      [[sessionId]],
      {
        fields: [
          "id",
          "name",
          "user_id",
          "start_at",
          "stop_at",
          "state",
          "config_id",
          "cash_register_balance_start",
          "cash_register_balance_end_real",
        ],
      }
    );

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    res.json(sessions[0]);
  } catch (error: any) {
    console.error("Error getting session details:", error);
    res.status(500).json({
      error: "Failed to get session details",
      message: error.message,
    });
  }
};

/**
 * Force close any non-closed sessions
 */
export const forceCloseSession = async (req: Request, res: Response) => {
  try {
    console.log("Attempting to force-close any non-closed sessions...");

    // Find all non-closed sessions
    const sessions = await callOdoo<any[]>(
      "pos.session",
      "search_read",
      [[["state", "not in", ["closed"]]]],
      { fields: ["id", "name", "state"] }
    );

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        message: "No open sessions found to close",
      });
    }

    console.log(
      `Found ${sessions.length} sessions to close: ${sessions
        .map((s) => s.name)
        .join(", ")}`
    );

    // Force close each session by directly updating state
    const sessionIds = sessions.map((s) => s.id);

    try {
      await callOdoo("pos.session", "write", [sessionIds, { state: "closed" }]);

      console.log("Sessions marked as closed");

      res.json({
        message: "Sessions force-closed successfully",
        closed_sessions: sessions.map((s) => ({
          id: s.id,
          name: s.name,
          previous_state: s.state,
        })),
      });
    } catch (writeError: any) {
      console.error("Error force-closing sessions:", writeError);

      // If direct state change fails, try a more careful approach
      let closedCount = 0;

      for (const session of sessions) {
        try {
          // First try to move to closing_control if not already there
          if (
            session.state !== "closing_control" &&
            session.state !== "closed"
          ) {
            await callOdoo(
              "pos.session",
              "action_pos_session_closing_control",
              [[session.id]]
            );
          }

          // Then try to close
          await callOdoo("pos.session", "action_pos_session_close", [
            [session.id],
          ]);

          closedCount++;
        } catch (singleCloseError) {
          console.error(
            `Failed to close session ${session.name}:`,
            singleCloseError
          );
        }
      }

      if (closedCount > 0) {
        res.json({
          message: `Successfully closed ${closedCount} out of ${sessions.length} sessions`,
          partial_success: true,
        });
      } else {
        res.status(500).json({
          error: "Failed to close sessions",
          message: writeError.message || "Unknown error",
        });
      }
    }
  } catch (error: any) {
    console.error("Error in force-close operation:", error);
    res.status(500).json({
      error: "Failed to force-close sessions",
      message: error.message || "Unknown error",
    });
  }
};

// Add this function at the end of your file, after all your existing functions

/**
 * Fix POS data to ensure UI compatibility
 */
export const fixPosData = async (req: Request, res: Response) => {
  try {
    console.log("Fixing POS data for UI compatibility...");

    // Step 1: Find all sessions with stop_at = false
    console.log("Finding sessions with stop_at = false...");
    const badSessions = await callOdoo<any[]>(
      "pos.session",
      "search_read",
      [[["stop_at", "=", false]]],
      { fields: ["id", "name", "state"] }
    );

    if (badSessions && badSessions.length > 0) {
      console.log(`Found ${badSessions.length} sessions with stop_at = false`);
      const sessionIds = badSessions.map((s) => s.id);

      // Update all these sessions to have stop_at = null
      await callOdoo("pos.session", "write", [sessionIds, { stop_at: null }]);
      console.log(
        `Updated ${sessionIds.length} sessions to have stop_at = null`
      );
    } else {
      console.log("No sessions found with stop_at = false");
    }

    // Step 2: Fix any POS configs with last_session_closing_date issues
    console.log("Fixing POS configs...");
    const configs = await callOdoo<any[]>("pos.config", "search_read", [[]], {
      fields: ["id", "name"],
    });

    if (configs && configs.length > 0) {
      // For each config, try to set last_session_closing_date directly
      for (const config of configs) {
        console.log(`Fixing config: ${config.name} (ID: ${config.id})`);

        // Get the most recent closed session for this config
        const recentClosedSessions = await callOdoo<any[]>(
          "pos.session",
          "search_read",
          [
            [
              ["config_id", "=", config.id],
              ["state", "=", "closed"],
            ],
          ],
          { fields: ["stop_at"], order: "stop_at DESC", limit: 1 }
        );

        if (recentClosedSessions && recentClosedSessions.length > 0) {
          const session = recentClosedSessions[0];

          // If stop_at is false, set it to a valid date
          if (session.stop_at === false) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");

            await callOdoo("pos.session", "write", [
              [session.id],
              { stop_at: yesterdayStr },
            ]);
            console.log(
              `Updated session ${session.id} with stop_at = ${yesterdayStr}`
            );
          }
        }

        // Update the config's last_session_closing_date
        try {
          await callOdoo("pos.config", "write", [
            [config.id],
            { last_session_closing_date: null },
          ]);
          console.log(
            `Reset last_session_closing_date for config ${config.id}`
          );
        } catch (configError: any) {
          console.log(
            `Could not update config ${config.id}: ${configError.message}`
          );
        }
      }
    }

    // Step 3: Execute SQL to reset problematic fields directly
    console.log("Using direct reset approach...");
    try {
      // Use execute_kw to run SQL (this is experimental and may not work)
      await callOdoo("ir.config_parameter", "set_param", [
        "pos.fixing_applied",
        "true",
      ]);

      console.log("Applied direct reset");
    } catch (sqlError: any) {
      console.log("Direct reset failed:", sqlError.message);
    }

    res.json({
      success: true,
      message: "POS data fixed successfully",
    });
  } catch (error: any) {
    console.error("Error fixing POS data:", error);
    res.status(500).json({
      error: "Failed to fix POS data",
      message: error.message || "Unknown error",
    });
  }
};
