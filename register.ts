import type { NextApiRequest, NextApiResponse } from 'next';

const PANEL_URL = process.env.PTERO_PANEL_URL; // contoh: "https://panel.domain.com"
const API_KEY = process.env.PTERO_API_KEY; // API Key Admin Pterodactyl

// Ganti sesuai node_id & egg_id server game default
const DEFAULT_NODE = 1;
const DEFAULT_EGG = 1;
const DEFAULT_ALLOCATION = 1; // Allocation ID (port) di node

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, password, ram } = req.body;
  if (!name || !email || !password || !ram)
    return res.status(400).json({ error: "Data tidak lengkap" });

  try {
    // 1. Buat user di Pterodactyl
    const userResp = await fetch(`${PANEL_URL}/api/application/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        username: name.replace(/\s/g, "") + Math.floor(Math.random() * 1000),
        email,
        first_name: name,
        last_name: "-",
        password,
      }),
    });

    if (!userResp.ok) {
      const err = await userResp.json();
      return res.status(400).json({ error: err.errors?.[0]?.detail || "Gagal buat user" });
    }
    const user = await userResp.json();

    // 2. Buat server untuk user tersebut
    const serverResp = await fetch(`${PANEL_URL}/api/application/servers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: `${name}'s Server`,
        user: user.attributes.id,
        egg: DEFAULT_EGG,
        docker_image: "ghcr.io/pterodactyl/yolks:java_17", // Contoh: Java server
        startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar",
        environment: {
          "SERVER_JARFILE": "server.jar",
          "VANILLA_VERSION": "latest"
        },
        limits: {
          memory: parseInt(ram),
          swap: 0,
          disk: 10000,
          io: 500,
          cpu: 100
        },
        feature_limits: {
          databases: 1,
          allocations: 1,
          backups: 1
        },
        allocation: {
          default: DEFAULT_ALLOCATION
        },
        deploy: null,
        start_on_completion: true,
      }),
    });

    if (!serverResp.ok) {
      const err = await serverResp.json();
      return res.status(400).json({ error: err.errors?.[0]?.detail || "Gagal buat server" });
    }
    const server = await serverResp.json();

    return res.status(200).json({
      email,
      password,
      panelUrl: PANEL_URL,
      serverId: server.attributes.identifier,
    });
  } catch (e) {
    return res.status(500).json({ error: "Terjadi kesalahan server." });
  }
}