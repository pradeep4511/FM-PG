import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ role, onSuccess }) {
  const [mode, setMode] = useState("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      if (mode === "signup") {

        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) throw error;

        const user = data.user;

        if (!user) {
          throw new Error("Unable to create account");
        }

        const { error: profileError } =
          await supabase
            .from("profiles")
            .insert({
              id: user.id,
              name,
              email,
              phone,
              role,
              location: role === "seeker" ? location : null
            });

        if (profileError) throw profileError;

        onSuccess({
          id: user.id,
          name,
          email,
          phone,
          location,
          role
        });

      } else {

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

        if (profileError) throw profileError;

        onSuccess(profile);
      }

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div className="auth-container">

      <h2>
        {role === "owner"
          ? "PG Owner Account"
          : "Find a PG"}
      </h2>

      <div className="auth-toggle">

        <button
          onClick={() => setMode("signup")}
        >
          Create Account
        </button>

        <button
          onClick={() => setMode("login")}
        >
          Login
        </button>

      </div>

      <form onSubmit={handleSubmit}>

        {mode === "signup" && (
          <>
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

            <input
              placeholder="Phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              required
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        {mode === "signup" && role === "seeker" && (
          <input
            placeholder="Your location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            required
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "signup"
              ? "Create Account"
              : "Login"}
        </button>

      </form>

    </div>
  );
}