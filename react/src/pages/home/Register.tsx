import { RegisterUser } from "../../types/users.types";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../api/users.api";
import { useNavigate } from "react-router";
import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
export function Register() {
  const navigate = useNavigate();

  const userEmpty = {
    name: "",
    email: "",
    password: "",
    id_number: "",
    phone: "",
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [newUser, setNewUser] = useState<RegisterUser>(userEmpty);

  const registerMutation = useMutation({
    mutationKey: ["register"],
    mutationFn: registerUser,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false)
      alert("User created, will be redirected to login");
      navigate("/login");
    },
    onError: (e) => {
      setLoading(false);
      setError(e);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(newUser);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };


  return (
    <section>
      <h2>Welcome to register</h2>
      {error && <BackEndError inputError={error} />}
      <form>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={newUser.name}
          onChange={handleChange}
        />
        <label htmlFor="email">Email</label>
        <input
          type="text"
          id="email"
          name="email"
          value={newUser.email}
          onChange={handleChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={newUser.password}
          onChange={handleChange}
        />
        <label htmlFor="id_number">ID Number</label>
        <input
          type="text"
          id="id_number"
          name="id_number"
          value={newUser.id_number}
          onChange={handleChange}
        />
        <label htmlFor="phone">Phone</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={newUser.phone}
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>
          {loading ? "Cargando..." : "Register"}
        </button>
      </form>
    </section>
  );
}
