import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, ScrollView, 
  TouchableOpacity, Image, Alert, ActivityIndicator 
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { Picker } from '@react-native-picker/picker'; // You may need to install this
import api from '../api/axiosConfig';

const RegisterScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dob: '', 
    bloodGroup: '',
    roleId: '',
  });

  const [image, setImage] = useState<any>(null);

  // Fetch Roles from Backend (Filtering out Student for Staff Registration)
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/api/roles');
        const staffRoles = res.data.filter((r: any) => r.name !== 'STUDENT');
        setRoles(staffRoles);
      } catch (_) {
        Alert.alert("Error", "Failed to load roles. Is the server running?");
      }
    };
    fetchRoles();
  }, []);

  const handlePickImage = () => {
    ImagePicker.openPicker({ width: 300, height: 300, cropping: true }).then(img => {
      setImage(img);
    }).catch(() => {});
  };

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.roleId) {
      Alert.alert("Required", "Please fill in all mandatory fields (*)");
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    if (image) {
      data.append('avatar', {
        uri: image.path,
        type: image.mime,
        name: 'staff-avatar.jpg',
      } as any);
    }

    try {
      await api.post('/api/staff/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert("Success", "Staff Registered Successfully!");
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>+ Staff Registration</Text>

        {/* Profile Image Section */}
        <Text style={styles.label}>Profile Image</Text>
        <TouchableOpacity style={styles.imageBox} onPress={handlePickImage}>
          {image ? (
            <Image source={{ uri: image.path }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadText}>Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields (2-column simulation) */}
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Enter full name" onChangeText={(v) => setFormData({...formData, fullName: v})} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Enter email" autoCapitalize="none" onChangeText={(v) => setFormData({...formData, email: v})} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="Create password" onChangeText={(v) => setFormData({...formData, password: v})} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" placeholder="Enter phone" onChangeText={(v) => setFormData({...formData, phone: v})} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput style={styles.input} placeholder="MM/DD/YYYY" onChangeText={(v) => setFormData({...formData, dob: v})} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.roleId}
                onValueChange={(itemValue) => setFormData({...formData, roleId: itemValue})}
              >
                <Picker.Item label="Select Role..." value="" />
                {roles.map((r) => (
                  <Picker.Item key={r.id} label={r.displayName} value={r.id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Back to Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerText}>Register Staff</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#0056b3', marginBottom: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputGroup: { width: '48%' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, fontSize: 14 },
  imageBox: { width: 120, height: 120, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  uploadPlaceholder: { alignItems: 'center' },
  uploadText: { fontSize: 12, color: '#888' },
  previewImage: { width: '100%', height: '100%' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  backBtn: { padding: 12, marginRight: 10 },
  backBtnText: { color: '#555', fontWeight: 'bold' },
  registerBtn: { backgroundColor: '#007bff', padding: 12, borderRadius: 5, minWidth: 120, alignItems: 'center' },
  registerText: { color: '#fff', fontWeight: 'bold' }
});

export default RegisterScreen;