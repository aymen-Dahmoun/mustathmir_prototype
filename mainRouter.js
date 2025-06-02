import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthProvider';
import supabase from './supabaseClient';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import RoleSelection from '../screens/common/RoleSelection';

import ProjectsList from '../screens/investor/ProjectsList';
import OwnerProfile from '../screens/owner/OwnerProfile';
import InvestorsList from '../screens/owner/InvestorsList';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="RoleSelection" component={RoleSelection} />
  </Stack.Navigator>
);

const InvestorStack = ({ users }) => (
  <Stack.Navigator>
    <Stack.Screen name="ProjectsList" component={ProjectsList} initialParams={{ users }} />
  </Stack.Navigator>
);

const OwnerStack = ({ users }) => (
  <Stack.Navigator>
    <Stack.Screen name="OwnerProfile" component={OwnerProfile} initialParams={{ users }} />
    <Stack.Screen name="InvestorsList" component={InvestorsList} initialParams={{ users }} />
  </Stack.Navigator>
);
const MainRouter = () => {
  const { user, loading } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndRole = async () => {
      if (user) {
        // Fetch only the authenticated user's data
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserData(data || null);
        setRole(data?.role || null);
      } else {
        setUserData(null);
        setRole(null);
      }
      setRoleLoading(false);
    };
    fetchUserDataAndRole();
  }, [user]);

  if (loading || roleLoading) return null; // Or a loading spinner

  // Pass userData as a prop to stacks/screens as needed
  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : role === 'owner' ? (
        <OwnerStack userData={userData} />
      ) : (
        <InvestorStack userData={userData} />
      )}
    </NavigationContainer>
  );
};

export default MainRouter;