import { useState } from "react";
import { supabase } from "../lib/supabase";

const PROFILE_STORAGE_PREFIX = "fm_pg_profile_";

function getProfileKey(email) {
  return `${PROFILE_STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

export default function Auth({ role, onSuccess }) {
  const [mode, setMode] = useState("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const profileKey = getProfileKey(email);

      if (mode === "signup") {
        const profileId = crypto.randomUUID();
        
        console.log("Creating profile with ID:", profileId);
        
        // Create profile in Supabase
        const { data, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: profileId,
            name,
            email,
            phone,
            role,
            location: role === "seeker" ? location : null,
          })
          .select()
          .single();

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        if (!data) {
          throw new Error("Profile created but no data returned from Supabase");
        }

        console.log("Profile created successfully in Supabase:", data);

        // Store the actual returned data from Supabase
        const profile = data;

        localStorage.setItem(profileKey, JSON.stringify(profile));
        console.log("Profile saved to localStorage:", profile);
        
        // Verify profile was created
        console.log("Profile ID being used:", profile.id);
        
        onSuccess(profile);
      } else {
        const savedProfile = localStorage.getItem(profileKey);

        if (!savedProfile) {
          throw new Error("No account found for this email. Please create one first.");
        }

        const profile = JSON.parse(savedProfile);
        onSuccess(profile);
      }
    } catch (err) {
      console.error("Auth error:", err);
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