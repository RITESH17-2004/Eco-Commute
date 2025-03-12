import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Avatar,
  Text,
  Alert,
  Divider,
  Box,
  RingProgress,
  Center,
  Transition,
  rem
} from '@mantine/core';
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconCheck, IconUserCircle, IconMail, IconEdit, IconX } from "@tabler/icons-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must be at least 2 characters' : null),
    }
  });

  const loadProfile = async (userId: string) => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        form.setValues({
          name: userData.name || "",
          email: user?.email || "",
        });
      } else {
        form.setValues({
          name: user?.displayName || "",
          email: user?.email || "",
        });
      }
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setError(`Failed to load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadProfile(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    
    return () => unsubscribe(); // Cleanup function to avoid memory leaks
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadProfile(user.uid);
    }
  }, [user]);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
        setEditMode(false); // Exit edit mode after successful save
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      await setDoc(doc(db, "users", user.uid), {
        name: values.name,
        email: user.email,
        updated_at: new Date().toISOString(),
      });
      
      setSaveSuccess(true);
    } catch (err: any) {
      console.error("Update error:", err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setError(null);
      setSaveSuccess(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    // Reset form to original values
    if (user) {
      loadProfile(user.uid);
    }
  };

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Center style={{ height: '50vh' }}>
          <RingProgress 
            size={120}
            thickness={12}
            sections={[{ value: 100, color: 'green' }]}
            label={<Text size="xs" ta="center">Loading profile</Text>}
          />
        </Center>
      </Container>
    );
  }

  const firstLetter = (form.values.name || user.displayName || "?").charAt(0).toUpperCase();

  return (
    <div style={{ 
        display: 'flex', 
        alignContent:'center',
        justifyContent: 'center', 
        width: '99vw',
        padding: '3rem 0'
      }}>
        <Container size="sm" py="xl" style={{ maxWidth: '1200px'}}>
        <Paper shadow="md" radius="lg" p="xl" withBorder>
        <Group justify="apart" mb="md">
            <Title order={2} ta="center" c="green.7">
                Profile Settings
            </Title>
            {!editMode && (
                <Button
                variant="light"
                color="green"
                onClick={toggleEditMode}
                leftSection={<IconEdit size={16} />}
                radius="md"
                >
                Edit Profile
                </Button>
            )}
            </Group>
                    
            <Divider my="md" />
            
            <Transition mounted={!!error} transition="fade" duration={400} timingFunction="ease">
            {(styles) => (
                <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Error" 
                color="red" 
                mb="lg" 
                variant="filled"
                style={styles}
                >
                {error}
                </Alert>
            )}
            </Transition>
            
            <Transition mounted={saveSuccess} transition="fade" duration={400} timingFunction="ease">
            {(styles) => (
                <Alert 
                icon={<IconCheck size={16} />} 
                title="Success" 
                color="green" 
                mb="lg" 
                variant="filled"
                style={styles}
                >
                Profile updated successfully!
                </Alert>
            )}
            </Transition>
            
            <Stack align="center" mb="xl" gap="xs">
            <Box
                style={{
                position: 'relative',
                marginBottom: 10,
                }}
            >
                <Avatar
                size={130}
                radius={130}
                src={user.photoURL || null}
                color="green.6"
                style={{
                    border: '4px solid var(--mantine-color-green-2)',
                    boxShadow: '0 4px 14px 0 rgba(0, 120, 0, 0.15)'
                }}
                >
                {!user.photoURL && firstLetter}
                </Avatar>
            </Box>
            <Text size="xl" fw={600} c="green.8">
                {form.values.name || user.displayName || ""}
            </Text>
            <Text size="sm" c="dimmed">
                Member since {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}
            </Text>
            </Stack>
            
            <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
                <TextInput
                label="Full Name"
                placeholder="Your name"
                leftSection={<IconUserCircle size={16} />}
                {...form.getInputProps("name")}
                size="md"
                radius="md"
                disabled={!editMode}
                styles={{
                    label: { fontSize: rem(16), marginBottom: rem(8) },
                }}
                />
                
                <TextInput
                label="Email Address"
                value={user.email || ""}
                leftSection={<IconMail size={16} />}
                disabled
                size="md"
                radius="md"
                styles={{
                    label: { fontSize: rem(16), marginBottom: rem(8) },
                }}
                />
                
                <Divider my="md" />
                
                {editMode && (
                <Group justify="center" mt="md">
                    <Button
                    type="button"
                    radius="md"
                    size="md"
                    variant="outline"
                    color="red"
                    onClick={cancelEdit}
                    leftSection={<IconX size={16} />}
                    >
                    Cancel
                    </Button>
                    <Button
                    type="submit"
                    radius="md"
                    size="md"
                    variant="gradient"
                    gradient={{ from: 'green.6', to: 'teal.5', deg: 35 }}
                    loading={loading}
                    leftSection={loading ? null : <IconCheck size={16} />}
                    style={{ minWidth: 180 }}
                    >
                    {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Group>
                )}
            </Stack>
            </form>
        </Paper>
        </Container>
    </div>    
  );
}