import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ role, onSuccess }) {
  const [mode, setMode] = useState("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        // STEP 1: Create real Supabase Auth user
        const {
          data: authData,
          error: authError,
        } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (authError) {
          throw authError;
        }

        const authUser = authData.user;

        if (!authUser) {
          throw new Error(
            "Account was not created. Please try again."
          );
        }
        console.log("AUTH DATA:", authData);
console.log("AUTH USER:", authData.user);
console.log("AUTH USER ID:", authData.user.id);
console.log(
  "PROFILE ID BEING INSERTED:",
  authData.user.id
);

        // STEP 2: Create matching profile using SAME Auth UUID
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .insert({
            id: authUser.id,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role,
            location:
              role === "seeker"
                ? location.trim()
                : null,
          })
          .select()
          .single();

        if (profileError) {
          throw profileError;
        }

        alert(
          "Account created successfully!"
        );

        onSuccess(profile);

      } else {

        // LOGIN USING SUPABASE AUTH
        const {
          data: loginData,
          error: loginError,
        } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (loginError) {
          throw loginError;
        }

        const authUser = loginData.user;

        if (!authUser) {
          throw new Error(
            "Login failed. User not found."
          );
        }

        // LOAD PROFILE USING AUTH USER ID
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        onSuccess(profile);
      }

    } catch (err) {
      console.error(
        "Authentication error:",
        err
      );

      setError(
        err.message ||
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
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
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
          }}
        >
          Create Account
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
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

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          minLength="6"
        />

        {mode === "signup" &&
          role === "seeker" && (
            <input
              placeholder="Your location"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
              required
            />
          )}

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