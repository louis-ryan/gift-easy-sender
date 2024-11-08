import Link from "next/link";

export default function OnboardingSuccess() {
    return (
      <div>
        <h1>Account Setup Complete!</h1>
        <p>
          Your payment account has been successfully set up. You can now receive
          payments for gifts through the registry.
        </p>
        <Link href="/">
          Return to Dashboard
        </Link>
      </div>
    );
  }