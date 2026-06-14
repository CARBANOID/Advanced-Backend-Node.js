# pm2
* acts as a process manager and load balancer by distributing incoming requests among avaiable CPU cores by creating worker processes (instances) of node.js application.

```sh
npm i pm2 
```

Simply run:

```bash
npx pm2 start dist/index.js -i max
```

pm2 handles everything automatically.

---

### What `-i max` Does

```
pm2 reads os.cpus().length  →  12 cores
spawns 12 worker processes  →  each runs index.js
```

---

### Useful pm2 Commands

```bash
# start with max workers
npx pm2 start dist/index.js -i max

# see all workers
npx pm2 list

# monitor CPU/memory of each worker live
npx pm2 monit

# stop all
npx pm2 stop all

# delete all the cached worker 
npx pm2 delete all

# see logs
npx pm2 logs
```

---


---

# autocannon

* Runs a load test on the selected HTTP endpoint, and reports statistics about the performance of the endpoint. 

```sh
npm i autocannon 
```

* Starting benchmarking:

```sh
npx autocannon -c <concurrent connections> -d <duration in seconds> <url>

# or with fixed request count:
npx autocannon -c <concurrent connections> -a <total requests> <url>

```

* example : 
```sh
npx autocannon -a 1200 -c 400 http://localhost:3000/heavy
```