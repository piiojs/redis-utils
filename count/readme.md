# Count

Safely counts keys matching a patters on Redis.

### Installation

```bash
npm install
chmod +x ./count.js
```

### Usage

```bash
./count.js [-h] [-p] [-a] [-t] [--pattern]
```

### Options [default]
* `-h` Redis hostname [127.0.0.1]
* `-p` Redis port [6379]
* `-a` Redis auth ['']
* `-t` Redis TLS [false]
* `--pattern` Glob pattern [\*]
