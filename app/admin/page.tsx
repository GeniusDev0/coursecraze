import dynamic from "next/dynamic";

import AdminLayout from "../teacher/layout";

const App = dynamic(() => import("./app"), { ssr: true });

const AdminPage = () => {
  return (
    <AdminLayout>
      <App />
    </AdminLayout>
  );
};

export default AdminPage;