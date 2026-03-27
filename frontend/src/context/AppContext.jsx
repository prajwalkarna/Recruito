import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { JobProvider } from "./JobContext";
import { NotificationProvider } from "./NotificationContext";
import { SocketProvider } from "./SocketContext";
import { ThemeProvider } from "./ThemeContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <UserProvider>
            <JobProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </JobProvider>
          </UserProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
