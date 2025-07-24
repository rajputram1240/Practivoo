module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/Practivoo",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
