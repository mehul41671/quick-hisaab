---
layout: default
---

<div class="app-container">
  <header class="app-header">
    <h1>Lottery Realtime</h1>
    <p class="subtitle">Your Real-time Lottery Management System</p>
  </header>

  <div class="app-content">
    <!-- Login Form -->
    <div class="login-container">
      <div class="login-form">
        <h2>Customer Login</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit" class="primary-button">Login</button>
          <p class="register-link">Don't have an account? <a href="#" id="registerLink">Register</a></p>
        </form>
      </div>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <h3>Real-time Management</h3>
        <p>Manage your lottery operations in real-time</p>
        <button class="app-button">Try Demo</button>
      </div>

      <div class="feature-card">
        <h3>Ticket Sales</h3>
        <p>Track and manage ticket sales efficiently</p>
        <button class="app-button">View Sales</button>
      </div>

      <div class="feature-card">
        <h3>Analytics</h3>
        <p>Get detailed insights and reports</p>
        <button class="app-button">View Analytics</button>
      </div>
    </div>

    <div class="cta-section">
      <h2>Ready to Get Started?</h2>
      <div class="button-group">
        <button class="primary-button">Login</button>
        <button class="secondary-button">Sign Up</button>
      </div>
    </div>
  </div>
</div>

# Lottery Realtime

Welcome to the Lottery Realtime documentation!

## Features

- Real-time lottery management
- Ticket sales tracking
- Analytics dashboard
- User management
- Secure transactions

## Getting Started

1. Clone the repository
2. Install dependencies
3. Run the development server
4. Access the application at `http://localhost:3000`

## Documentation

For detailed documentation, please visit our [GitHub repository](https://github.com/mehul41671/quick-hisaab). 

<script>
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // For demo purposes, we'll use hardcoded credentials
  if (username === 'admin' && password === 'password') {
    alert('Login successful! Redirecting to dashboard...');
    // Redirect to your actual application
    window.location.href = 'http://localhost:3000/dashboard';
  } else {
    alert('Invalid username or password');
  }
});

document.getElementById('registerLink').addEventListener('click', function(e) {
  e.preventDefault();
  alert('Registration feature coming soon!');
});
</script> 