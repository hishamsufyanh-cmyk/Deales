import React, { useContext } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

type Props = RouteProps & { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children, ...rest }) => {
  const { token } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={() => (token ? children : <Redirect to="/" />)}
    />
  );
};

export default ProtectedRoute;