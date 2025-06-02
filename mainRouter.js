import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import supabase from './supabaseClient';

import SignUpScreen from './screens/authScreens/SignUp';
import LoginScreen from './screens/authScreens/Login';

// import ProjectsList from '../screens/investor/ProjectsList';
// import OwnerProfile from '../screens/owner/OwnerProfile';
// import InvestorsList from '../screens/owner/InvestorsList';
import Profile from './screens/commonScreens/Profile';
import { useAuth } from './context/AuthProvider';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignUpScreen} />
  </Stack.Navigator>
);

const InvestorStack = ({ user }) => (
  <Stack.Navigator>
    <Stack.Screen name="ProjectsList" component={Profile} initialParams={{ user }} />
  </Stack.Navigator>
);

const OwnerStack = ({ user }) => (
  <Stack.Navigator initialRouteName='OwnerProfile'>
    <Stack.Screen name="OwnerProfile" component={Profile} initialParams={{ user }} />
    {/* <Stack.Screen name="InvestorsList" component={InvestorsList} initialParams={{ user }} /> */}
  </Stack.Navigator>
);
const MainRouter = () => {
  const { user, loading } = useAuth();
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

  if (loading || roleLoading) return null;

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : role === 'owner' ? (
        <OwnerStack user={userData} />
      ) : (
        <InvestorStack user={userData} />
      )}
    </NavigationContainer>
  );
};

export default MainRouter;