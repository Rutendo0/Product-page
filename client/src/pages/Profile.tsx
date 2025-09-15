import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p>Please log in to view your profile.</p>
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-green-950 rounded-lg shadow p-6 max-w-md">
        <div className="space-y-2">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div className="mt-6 space-x-4">
          <Link href="/orders">
            <Button variant="outline">View Orders</Button>
          </Link>
          <Button onClick={logout} variant="destructive">
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;