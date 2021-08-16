#!/usr/bin/env node

// const app = require("../src/app")
const args = require("args")
const chalk = require("chalk")
const { list, terminate, scan, libMngt } = require("../dist/cli/library-management")
const install = require("../dist/cli/install")

const listCommand = async () => {
    await list()
    terminate()
}

const scanCommand = async (name, sub, { r }) => {
    let libPath
    let rec
    if (r === true) {
        rec = true
        libPath = sub[0]
    }
    else {
        rec = true
        libPath = r
    }
    if (!libPath) throw "path not found"
    await scan(libPath, rec)
    terminate()
}

const manageCommand = async () => {
    await libMngt()
}

const installCommand = async () => {
    await install()
}

args
    .command("list", "list all music folders", listCommand)
    .command("scan", "scan a music folder, add or update", scanCommand)
    .command("manage", "library management program", manageCommand)
    .command("setup", "set-up program", installCommand)
    .option("rec", "scan the folder recursively")

args.parse(process.argv)
