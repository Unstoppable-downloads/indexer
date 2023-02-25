# USDL - UnStoppable DownLoads 

USDL is a censorship-resistant content sharing infrastructure built on iExec and IPFS. 

Our goal is to empower individuals with an unstoppable right to share any artifacts with their community. This is achieved with decentralization and cryptography. 
Ultimately, this empowerment means that everyone bears the sole responsibility of what they share for the good or bad of the community. 



## Contents
- [USDL - UnStoppable DownLoads](#usdl---unstoppable-downloads)
  - [Contents](#contents)
  - [Economics](#economics)
    - [The value network](#the-value-network)
    - [Content Providers](#content-providers)
    - [Indexers](#indexers)
    - [Content Consumers](#content-consumers)
  - [Data Model](#data-model)
    - [Metadata](#metadata)
    - [FileChunk](#filechunk)
  - [Unstoppable architecture](#unstoppable-architecture)
    - [Current topology](#current-topology)
    - [Way forward](#way-forward)
    - [Alternative way forward](#alternative-way-forward)
  - [Workflows](#workflows)
    - [Content publishing workflow](#content-publishing-workflow)
    - [Content indexing workflow](#content-indexing-workflow)
    - [Content consuming workflow](#content-consuming-workflow)

---

USDL is a decentralised file sharing application built on iExec infrastructure protocol and IPFS. 

Our goal is to empower individuals with true ownership over their contents through decentralization and cryptography. Ultimately, this empowerment means that everyone bears the sole responsibility of what they share for the good or bad of the community. 


## Economics
We believe that a service like USDL is viable only if it serves a sustainable economic model, based on transfers of value between  network participants.

### The value network
We distinguish 3 main network participants : Content Providers, Indexers, Content Consumers. The diagram below illustrated how values flows in USDL's ecosystem.

![USDL Value Network](./media/usdl_value_network.png)

### Content Providers
The value they bring to the network is the content they created or acquired. 
Content Providers have the option to directly sell their content's metadata (see data model section) to Indexers. 
Monetization is achieved by using iExec's marketplace built-in governance rules where datasets can be sold in exchange of $RLC (iExec's marketplace utility token)

### Indexers
The value they bring to Content Consumers is the aggregated searchable index of content. 

Indexers can choose to incentivize Content Providers i.e. buying metadata datasets on iExec's marketplace. 

Also, Indexers have the option to implement their own conditional access to contents should they want to maximize XXXXXXXX 

- Content Consumer must have at least x $RLC in their wallet
- Content Consumer must own a given NFT 
- Content Consumer must be a Content Provider too
- ...


### Content Consumers
The value they bring to the network is their attention (traffic) that Indexers can monetize from Advertising or Affiliate platforms. 
Optionaly, they can choose to donate to Content Providers 


## Data Model

### Metadata 
This data structure holds the information that is necessary for indexing. 

| Property | Type | Description |
| ------ | ------ | ------ |
| title | string | File's title | 
| fileName | string | Actual file name | 
| uid | string | File unique identifier | 
| fileSize | number | file size in bytes | 
| chunks | Array Of FileChunk | Array of file chunks metadata | 
| hash | string | Hash of the file contents | 
| imdb | string | IMDB id (applicable to Movies and Series) | 
| imdb_starring | string | Actors / Cast (applicable to Movies and Series) |
| imdb_year | string | Year of release (applicable to Movies and Series)  |
| category | string | Indexing category for the file | 
| description | string | File description | 

### FileChunk
Files are splitted across multiple chunks. `FileChunk` is the data structure that holds each chunk's metadata.

| Property | Type | Description |
| ------ | ------ | ------ |
| cid | string | IPFS Content Identifier of the file part |
| size | Number | Size of the file part |
| checksum | number | Checksum |
| sequence | number | sequence number of this file part |
| byteBegin | number | Starting byte index of this chunk |
| byteEnd | number | Ending byte index of this chunk |


## Unstoppable architecture

### Current topology

### Way forward 

### Alternative way forward

## Workflows

### Content publishing workflow

### Content indexing workflow

### Content consuming workflow



[def]: #usdl---unstoppable-downloads