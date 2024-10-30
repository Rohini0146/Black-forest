import { useState } from "react";
import axios from 'axios';

function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");  // Added state for role

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/addemp', { name, email, password, role })
      .then(result => {
        console.log(result);
        alert('Added Successful!');
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>

      {/* Add Employee Form */}
      <div className="card mb-3">
        <div className="card-header">
          Add New Employee
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name">
                <strong>Name</strong>
              </label>
              <input
                type="text"
                placeholder="Enter Name"
                autoComplete="off"
                name="name"
                className="form-control rounded-0"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Email</strong>
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                name="email"
                className="form-control rounded-0"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password">
                <strong>Password</strong>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                autoComplete="off"
                name="password"
                className="form-control rounded-0"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="role">
                <strong>Role</strong>
              </label>
              <select
                className="form-control rounded-0"
                name="role"
                onChange={(e) => setRole(e.target.value)}  // Added onChange handler for role
              >
                <option value="">Select Role</option>
                <option value="editor">SEO Editor</option>
                <option value="manager">SEO Manager</option>
                <option value="subscriber">Subscriber</option>
                <option value="contributer">Contributer</option>
                <option value="author">Author</option>
                <option value="editor">Editor</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Add Employee</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
