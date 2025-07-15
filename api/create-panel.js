export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, ram, cpu } = req.body;
  if (!username) return res.status(400).json({ error: 'Username wajib diisi' });

  const panelUrl = "https://wannhosting.tokopanelmurah.biz.id";
  const apikey = "ptla_K5vp10FkOABt630ZlfJpub9xymohkwQRoXpRKFE7v2Q";
  const nestid = 5;
  const egg = 15;
  const loc = 1;

  const docker_image = "ghcr.io/pterodactyl/yolks:nodejs_18";
  const startup = "npm start";

  const password = `${username}001`;
  const email = `${username}@gmail.com`;
  const ramMb = ram === "Unlimited" ? 0 : parseInt(ram) * 1024;
  const cpuVal = cpu === "Unlimited" ? 0 : parseInt(cpu);

  try {
    // 1. Create user
    const userRes = await fetch(`${panelUrl}/api/application/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`
      },
      body: JSON.stringify({
        username,
        email,
        first_name: username,
        last_name: "FR3",
        password
      })
    });

    if (!userRes.ok) {
      const err = await userRes.text();
      return res.status(500).json({ error: "Gagal membuat user", detail: err });
    }

    const userData = await userRes.json();
    const userId = userData.attributes.id;

    // 2. Create 2 servers
    const servers = [];

    for (let i = 1; i <= 2; i++) {
      const name = `${username}${i} Server`;

      const serverRes = await fetch(`${panelUrl}/api/application/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({
          name,
          user: userId,
          nest: nestid,
          egg,
          docker_image,
          startup,
          environment: {},
          limits: {
            memory: ramMb,
            swap: 0,
            disk: ramMb,
            io: 500,
            cpu: cpuVal
          },
          feature_limits: {
            databases: 1,
            backups: 1,
            allocations: 1
          },
          allocation: {
            default: loc
          }
        })
      });

      if (!serverRes.ok) {
        const err = await serverRes.text();
        return res.status(500).json({ error: "Gagal membuat server", detail: err });
      }

      const serverData = await serverRes.json();
      servers.push(serverData.attributes.name);
    }

    res.status(200).json({ username, email, password, servers });

  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}