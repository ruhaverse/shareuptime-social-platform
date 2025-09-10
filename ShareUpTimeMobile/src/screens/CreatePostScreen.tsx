import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {postService} from '../services/PostService';

const CreatePostScreen = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Hata', 'Gönderi içeriği boş olamaz');
      return;
    }

    setLoading(true);
    try {
      const response = await postService.createPost({
        content: content.trim(),
      });

      if (response.success) {
        Alert.alert('Başarılı', 'Gönderi paylaşıldı!');
        setContent('');
      } else {
        Alert.alert('Hata', response.message || 'Gönderi paylaşılamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yeni Gönderi</Text>
        <TouchableOpacity
          style={[styles.shareButton, loading && styles.shareButtonDisabled]}
          onPress={handleCreatePost}
          disabled={loading || !content.trim()}>
          <Text style={styles.shareButtonText}>
            {loading ? 'Paylaşılıyor...' : 'Paylaş'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ne düşünüyorsun?"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={280}
          />
          <Text style={styles.characterCount}>
            {content.length}/280
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <Icon name="photo-camera" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Fotoğraf</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Icon name="videocam" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Icon name="location-on" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Konum</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Icon name="tag" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Etiket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonDisabled: {
    backgroundColor: '#ccc',
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  textInput: {
    fontSize: 18,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 10,
  },
  optionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default CreatePostScreen;
