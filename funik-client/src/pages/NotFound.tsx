import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-gradient text-7xl font-black sm:text-8xl">404</h1>
      <p className="text-lg text-muted-foreground">Oops! This page wandered off the board.</p>
      <Link to="/" className={buttonVariants({ size: "lg" })}>
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
