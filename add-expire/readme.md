# Add Expire

Safely sets expiration for keys matching a patters on Redis. This operation will override any expiration set on the keys.

### Installation

```bash
npm install
chmod +x ./expire.js
```

### Usage

```bash
./expire.js [-h] [-p] [-a] [--pattern] [--time]
```

### Options [default]
* `-h` Redis hostname [127.0.0.1]
* `-p` Redis port [6379]
* `-a` Redis auth ['']
* `--pattern` Glob pattern [\*]
* `--time` Expiration time in seconds [7776000]
