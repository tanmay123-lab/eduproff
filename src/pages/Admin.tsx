import React from 'react';
import Layout from '../components/Layout';
import { getUsers, getCertificates, getActivityLogs } from '../utils/adminStorage';

const Admin = () => {
    const users = getUsers();
    const certificates = getCertificates();
    const activities = getActivityLogs();

    return (
        <Layout>
            <h1>Admin Dashboard</h1>
            <div>
                <h2>Total Users: {users.length}</h2>
                <h2>Total Certificates: {certificates.length}</h2>
                <h3>Recent Activities:</h3>
                <ul>
                    {activities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                    ))}
                </ul>
                
                {/* Additional components to display role-wise lists and certificates can be added here */}
            </div>
        </Layout>
    );
};

export default Admin;