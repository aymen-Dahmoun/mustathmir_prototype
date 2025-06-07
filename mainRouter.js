import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import supabase from './supabaseClient';
import NavBar from './comps/NavBar';
import SignUpScreen from './screens/authScreens/SignUp';
import LoginScreen from './screens/authScreens/Login';

import Profile from './screens/commonScreens/Profile';
import { useAuth } from './context/AuthProvider';
import AddProject from './screens/ownerScreens/AddProject';
import InvestorsList from './screens/ownerScreens/InvestorsListScreen';
import CoverLetterScreen from './screens/commonScreens/CoverLetterScreen';
import ProjectLists from './screens/inverstorScreens/ProjectLists';
import Notifications from './screens/commonScreens/Notifications';
import { KeyboardAvoidingView, Platform } from 'react-native';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignUpScreen} />
  </Stack.Navigator>
);

const InvestorStack = ({ user }) => {
  const navigation = useNavigation();
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Profile" 
          component={ProjectLists} 
          initialParams={{ userData: user }} 
        />
        <Stack.Screen 
          name="Letter" 
          component={CoverLetterScreen} 
          initialParams={{ userData: user }} 
        />
        <Stack.Screen
          name="ProjectsList" 
          component={Profile} 
          initialParams={{ userData: user }} 
        />
        <Stack.Screen 
          name="Notification" 
          component={Notifications}
          initialParams={{ userData: user }} 
        />
      </Stack.Navigator>
      
      <NavBar
        middleBtn={"المشاريع"}
        onProfile={() => {navigation.navigate('ProjectsList')}}
        onInvestors={() => navigation.navigate('Profile')}
        onSettings={() => navigation.navigate('Add Project')}
        onNotifications={() => navigation.navigate('Notification')}
      />
    </>
  );
};

const OwnerStack = ({ user }) => {
  const navigation = useNavigation();
  return (
    <>
      <Stack.Navigator initialRouteName='Profile' screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Profile" 
          component={Profile}
          initialParams={{ userData: user }} 
        />
        <Stack.Screen 
          name="Inverstors"
          component={InvestorsList}
          initialParams={{ userData: user }}
        />
        <Stack.Screen 
          name="Add Project" 
          component={AddProject}
          initialParams={{ userData: user }} 
        />
        <Stack.Screen 
          name="Letter" 
          component={CoverLetterScreen}
          initialParams={{ userData: user }} 
        />
        <Stack.Screen 
          name="Notification" 
          component={Notifications}
          initialParams={{ userData: user }} 
        />
      </Stack.Navigator>
      <NavBar
        middleBtn={"المستثمرون"}
        onProfile={() => {navigation.navigate('Profile')}}
        onInvestors={() => navigation.navigate('Inverstors')}
        onSettings={() => navigation.navigate('Add Project')}
        onNotifications={() => navigation.navigate('Notification')}
      />
    </>
  );
};

const MainRouter = () => {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndRole = async () => {
      if (user) {
        console.log('Fetching user data for ID:', user.id);
        
        // Fetch only the authenticated user's data
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        console.log('Query result - data:', data);
        console.log('Query result - error:', error);
        
        if (error) {
          console.error('Error fetching user data:', error.message);
          // If user profile doesn't exist, you might want to redirect to complete profile
          // or handle this case differently
        }
        
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

  if (user && !userData) {
    return (
      <NavigationContainer>
      <AuthStack />
      </NavigationContainer>
    );
  }

  return (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex:1}} >
    
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : role === 'owner' ? (
        <OwnerStack user={userData}/>
      ) : (
        <InvestorStack user={userData}/>
      )}
    </NavigationContainer>
            </KeyboardAvoidingView>
  );
};

export default MainRouter;