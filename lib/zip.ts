import { crc32 } from "node:zlib";

/**
 * createZip — bouwt een geldig ZIP-archief zonder externe dependency.
 *
 * Gebruikt de "store"-methode (geen compressie): de document-PDF's zijn zelf
 * al gecomprimeerd, dus deflaten levert nauwelijks winst en store houdt de
 * encoder simpel en snel. CRC-32 komt uit node:zlib (Node 20.15+/22).
 *
 * Alleen ASCII-bestandsnamen worden verwacht (de doc-labels zijn ASCII), dus
 * de general-purpose bit voor UTF-8 hoeft niet gezet te worden.
 */
export function createZip(files: { name: string; data: Buffer }[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  // Vaste mod-datum (1980-01-01) zodat strikte unzip-tools niet klagen over
  // een lege datum; de tijd laten we op 0.
  const DOS_DATE = 0x0021;
  const DOS_TIME = 0x0000;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, "ascii");
    const size = file.data.length;
    const crc = crc32(file.data) >>> 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed to extract
    local.writeUInt16LE(0, 6); // general purpose flag
    local.writeUInt16LE(0, 8); // compression method: 0 = store
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18); // compressed size
    local.writeUInt32LE(size, 22); // uncompressed size
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra field length
    localParts.push(local, nameBuf, file.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // central directory signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8); // flags
    central.writeUInt16LE(0, 10); // method
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(size, 20);
    central.writeUInt32LE(size, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra length
    central.writeUInt16LE(0, 32); // comment length
    central.writeUInt16LE(0, 34); // disk number start
    central.writeUInt16LE(0, 36); // internal attributes
    central.writeUInt32LE(0, 38); // external attributes
    central.writeUInt32LE(offset, 42); // relative offset of local header
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + size;
  }

  const centralBuf = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(0, 4); // number of this disk
  end.writeUInt16LE(0, 6); // disk with central directory
  end.writeUInt16LE(files.length, 8); // entries on this disk
  end.writeUInt16LE(files.length, 10); // total entries
  end.writeUInt32LE(centralBuf.length, 12); // size of central directory
  end.writeUInt32LE(offset, 16); // offset of central directory
  end.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localParts, centralBuf, end]);
}
