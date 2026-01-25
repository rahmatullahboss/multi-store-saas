# Clawdbot VPS Access & Monitoring Guide

This guide contains everything you need to manage your new Clawdbot VPS on Google Cloud.

## 🚀 Future Access (CLI)

To access your VPS from your Mac terminal in the future, run:

```bash
/opt/homebrew/share/google-cloud-sdk/bin/gcloud compute ssh clawdbot-vps --zone=us-central1-a
```

> [!TIP]
> You can add an alias to your `~/.zshrc` file for faster access:
> `alias vps="/opt/homebrew/share/google-cloud-sdk/bin/gcloud compute ssh clawdbot-vps --zone=us-central1-a"`

---

## 📊 Resource Monitoring

Once you are logged into the VPS, you can use these commands to monitor performance:

| Command   | Purpose                                                                 |
| :-------- | :---------------------------------------------------------------------- |
| `htop`    | **Recommended:** Real-time CPU, RAM, and Task monitoring (interactive). |
| `free -m` | Quick check for RAM and Swap usage (in MB).                             |
| `df -h`   | See how much Disk space is left.                                        |

---

## 🦞 Clawdbot Commands

| Command              | Action                                                                    |
| :------------------- | :------------------------------------------------------------------------ |
| `clawdbot configure` | **IMPORTANT:** Run this first to set up your AI models and chat channels. |
| `clawdbot start`     | Start the Clawdbot agent.                                                 |
| `clawdbot version`   | Check the currently installed version.                                    |

---

## 🔒 Security Note

Since this is a VPS, it is isolated from your personal Mac files. Ensure you keep your SSH keys secure and do not share your Gateway tokens.
