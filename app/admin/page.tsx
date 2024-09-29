import dynamic from "next/dynamic";


const App = dynamic(() => import("./app"), { ssr: true });

const AdminPage = () => {

  return (
    <div>
      <App />
    </div>
  );
};

export default AdminPage;
