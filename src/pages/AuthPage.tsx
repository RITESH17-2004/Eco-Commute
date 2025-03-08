import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, Paper, Title, TextInput, PasswordInput, Button, Text, Group, Stack, Anchor, Divider, rem, Box 
} from "@mantine/core";
import { IconLeaf, IconAt, IconLock, IconUser } from "@tabler/icons-react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // Redirect to home page
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        // Create new user
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/"); // Redirect after successful login/signup
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Box 
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4f1eb 100%)",
        minHeight: "85vh",
        paddingTop: rem(20),
        paddingBottom: rem(40),
        width: "99vw",
      }}
    >
      <Container size="xs" py={rem(60)} px={rem(60)}>
        <Paper 
          radius="md" 
          p={rem(30)} 
          withBorder 
          shadow="md"
          style={{ 
            backdropFilter: "blur(5px)",
            background: "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))",
          }}
        >
          <Box ta="center" mb={rem(25)}>
            <IconLeaf 
              size={20} 
              color="teal" 
              stroke={1.5} 
              style={{ marginBottom: rem(10) }} 
            />
            <Title order={2} fw={700} c="teal.7">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Title>
            <Text size="sm" c="dimmed" mt={rem(5)}>
              {isSignUp ? "Join Carbon Sync today" : "Sign in to Carbon Sync"}
            </Text>
          </Box>

          <Divider my={rem(20)} label="Account Details" labelPosition="center" />

          {error && <Text c="red" size="sm" ta="center">{error}</Text>}

          <form onSubmit={handleSubmit}>
            <Stack gap={rem(22)}>
              {isSignUp && (
                <TextInput
                  label="Full Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                  radius="md"
                  size="md"
                  required
                  leftSection={<IconUser size={24} stroke={1.5} color="black" />}
                  mb={rem(6)}
                  styles={{
                    label: { fontSize: rem(16), marginBottom: rem(8) },
                  }}
                />
              )}

              <TextInput
                label="Email Address"
                placeholder="hello@example.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                radius="md"
                size="md"
                required
                leftSection={<IconAt size={24} stroke={1.5} color="black" />}
                mb={rem(6)}
                styles={{
                  label: { fontSize: rem(16), marginBottom: rem(8) },
                }}
              />

              <PasswordInput
                label="Password"
                placeholder="Your secure password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                radius="md"
                size="md"
                required
                leftSection={<IconLock size={24} stroke={1.5} color="black" />}
                mb={rem(6)}
                styles={{
                  label: { fontSize: rem(16), marginBottom: rem(8) },
                }}
              />
              
              {!isSignUp && (
                <Anchor
                  size="sm"
                  c="teal"
                  td="none"
                  ta="right"
                  style={{ display: "block", marginTop: rem(5) }}
                >
                  Forgot your password?
                </Anchor>
              )}
            </Stack>

            <Button
              type="submit"
              radius="md"
              size="md"
              fullWidth
              mt={rem(25)}
              variant="gradient"
              gradient={{ from: "teal.7", to: "green.5", deg: 105 }}
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
            
            <Divider my={rem(25)} label="or" labelPosition="center" />
            
            <Group justify="center">
              <Text size="sm" c="dimmed">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </Text>
              <Anchor
                c="teal"
                fw={500}
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ cursor: "pointer" }}
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </Anchor>
            </Group>
          </form>
        </Paper>
      </Container>
    </Box>    
  );
}
