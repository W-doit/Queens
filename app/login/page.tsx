import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center font-playfair">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </div>
  );
}