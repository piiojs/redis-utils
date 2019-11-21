Dealing with large databases on Redis is quite painful so we build these utils that are based on the SCAN operation so they will not block your database.
We will continue adding new operations as soon as we find it necessary. Feel free to report any bugs or contribute with new operations.

# Count

Safely counts keys matching a patters on Redis.

### Installation

```bash
npm install
chmod +x ./count.js
```

### Usage

```bash
./count.js [-h] [-p] [--pattern]
```

### Options [default]
* `-h` Redis hostname [127.0.0.1]
* `-p` Redis port [6379]
* `--pattern` Glob pattern [\*]

___


# Add Expire

Safely sets expiration for keys matching a patters on Redis. This operation will override any expiration set on the keys.

### Installation

```bash
npm install
chmod +x ./expire.js
```

### Usage

```bash
./expire.js [-h] [-p] [--pattern] [--time]
```

### Options [default]
* `-h` Redis hostname [127.0.0.1]
* `-p` Redis port [6379]
* `--pattern` Glob pattern [\*]
* `--time` Expiration time in seconds [7776000]

___


# Migrate

Migrates keys matching a pattern from one Redis to another. This procedure involves two scripts:
1. Download keys and its values matching a pattern from **origin** Redis.
2. Upload keys to **destination** Redis

Be aware that this procedure will remove all expires.

### Installation

```bash
npm install
chmod +x ./download.js
chmod +x ./upload.js
```

### download.js usage

```bash
./download.js [-h] [-p] [--pattern] [--filename]
```
### download.js options [default]
* `-h` **origin** Redis hostname [127.0.0.1]
* `-p` **origin** Redis port [6379]
* `--pattern` Glob pattern [\*]
* `--filename` Filename of the json [dump.json]

### upload.js usage

```bash
./upload.js [-h] [-p] [--filename]
```
### upload.js options [default]
* `-h` **destination** Redis hostname [127.0.0.1]
* `-p` **destination** Redis port [6379]
* `--filename` Filename of the json [dump.json]

___


# Oldest key

Get the oldest idle time.

### Installation

```bash
npm install
chmod +x ./oldest.js
```

### Usage

```bash
./oldest.js [-h] [-p]
```

### Options [default]
* `-h` Redis hostname [127.0.0.1]
* `-p` Redis port [6379]
