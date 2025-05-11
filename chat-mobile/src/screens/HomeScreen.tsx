import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import UploadArea from '../components/UploadArea';
import { colors } from '../theme/colors';
import { uploadDocument } from '../services/api';
import { UploadProgress } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: UploadProgress
  }>({});

  const handleFileSelect = async (file: DocumentPicker.DocumentResult) => {
    if (file.type !== 'success') return;

    setUploadingFiles(prev => ({
      ...prev,
      [file.name]: { fileName: file.name, progress: 0, status: 'uploading' }
    }));

    try {
      await uploadDocument(file);
      
      setUploadingFiles(prev => ({
        ...prev,
        [file.name]: { fileName: file.name, progress: 100, status: 'success' }
      }));

      // Navigate to chat after successful upload
      navigation.navigate('Chat', { chatId: '' });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadingFiles(prev => ({
        ...prev,
        [file.name]: { fileName: file.name, progress: 0, status: 'error' }
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="chatbubbles" size={24} color={colors.primary} />
            <Text style={styles.logoText}>Rag chatbot</Text>
          </View>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => navigation.navigate('Chat', { chatId: '' })}
          >
            <Ionicons name="add" size={24} color={colors.text.primary} />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.uploadContainer}>
          <Text style={styles.title}>Please Upload the Documents</Text>
          <Text style={styles.subtitle}>Before you ask Rag</Text>
          <UploadArea onFileSelect={handleFileSelect} />
          
          {Object.values(uploadingFiles).map((file) => (
            <View key={file.fileName} style={styles.uploadStatus}>
              <Text style={styles.fileName}>{file.fileName}</Text>
              <Text style={[
                styles.statusText,
                file.status === 'success' ? styles.successText : 
                file.status === 'error' ? styles.errorText : 
                styles.uploadingText
              ]}>
                {file.status === 'uploading' ? `${file.progress}%` :
                 file.status === 'success' ? 'Completed' : 'Failed'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  sidebar: {
    width: '100%',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    padding: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  newChatText: {
    color: colors.text.primary,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  uploadStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 8,
  },
  fileName: {
    color: colors.text.primary,
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadingText: {
    color: colors.primary,
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.error,
  },
}); 