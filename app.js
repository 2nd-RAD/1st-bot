// App.js (Expo React Native Mining Bot App)
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'https://1st-run.vercel.app/api'; // Change this

export default function App() {
  const [uid, setUid] = useState('');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [claimed, setClaimed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('uid').then(storedUid => {
      if (storedUid) {
        setUid(storedUid);
        fetchUser(storedUid);
      }
    });
  }, []);

  const fetchUser = async (uid) => {
    const res = await axios.get(`${API_BASE}/check-user`, { params: { uid } });
    setUser(res.data);
    setPoints(res.data.points || 0);
    setClaimed(res.data.claimed || 0);
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/start-mining`, { uid });
      setPoints(res.data.newPoints);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/claim-points`, { uid });
      setPoints(0);
      setClaimed(claimed + res.data.claimed);
      Alert.alert('Success', `Claimed $${(res.data.claimed / 7).toFixed(2)}`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to claim');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUid = async () => {
    await AsyncStorage.setItem('uid', uid);
    fetchUser(uid);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Enter your UID:</Text>
        <TextInput value={uid} onChangeText={setUid} style={styles.input} />
        <Button title="Submit" onPress={handleSubmitUid} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>UID: {uid}</Text>
      <Text>Status: {user.paid ? 'Paid' : 'Free'}</Text>
      <Text>Points: {points} ({(points / 7).toFixed(2)} USD)</Text>
      <Text>Claimed: ${(claimed / 7).toFixed(2)}</Text>

      <Button title="Start Mining" onPress={handleStart} disabled={loading} />
      <View style={{ height: 20 }} />
      <Button title="Convert & Claim" onPress={handleClaim} disabled={points < 7 || loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  input: { borderColor: 'gray', borderWidth: 1, padding: 10, width: '100%', marginVertical: 10 }
});
