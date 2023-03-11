import * as IPFS from "ipfs-core"

export const ipfs = await IPFS.create();

export const createIPFS = async () => {
    const { cid } = await ipfs.add("Hello world");
    console.log("cid: ", cid) 
}

/**
 * 
 * @param {string | CID<unknown, number, number, Version>} cid contend ID to pin
 */
export const pinCIDs = async (cid) => {
    const pinned = await ipfs.pin.add(cid)
    console.log("Pinned", pinned)
}