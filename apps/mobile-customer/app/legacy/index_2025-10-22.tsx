import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000000' }}>
        DryJets Test Screen
      </Text>
      <Text style={{ fontSize: 16, color: '#666666', marginTop: 12 }}>
        If you see this, routing works!
      </Text>
    </View>
  );
}
