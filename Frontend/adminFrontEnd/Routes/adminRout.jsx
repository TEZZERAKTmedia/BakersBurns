import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const AdminRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Assume role is stored in local storage after login

  return (
    <Route
      {...rest}
      render={(props) =>
        token && userRole === 'admin' ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default AdminRoute;
