import { useAuthStore } from '../store';

const HomePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-tinder-dark">
        Welcome to Loco, {user?.name}!
      </h2>
      <p className="text-tinder-gray">
        Your journey begins here.
      </p>
      
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold text-tinder-dark mb-4">Your Profile</h3>
        <div className="space-y-2 text-tinder-gray">
          <p><span className="font-medium">Email:</span> {user?.email}</p>
          {user?.age && <p><span className="font-medium">Age:</span> {user.age}</p>}
          {user?.gender && <p><span className="font-medium">Gender:</span> {user.gender}</p>}
          {user?.bio && <p><span className="font-medium">Bio:</span> {user.bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
