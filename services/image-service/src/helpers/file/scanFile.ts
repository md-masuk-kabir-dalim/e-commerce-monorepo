import NodeClam from "clamscan";
import os from "os";

const scanFile = async (filePath: string) => {
  if (os.platform() === "win32") {
    return;
  }

  const clamscan = await new NodeClam().init({
    removeInfected: false,
    quarantineInfected: false,
    scanLog: undefined,
    debugMode: false,
    clamdscan: {
      host: "127.0.0.1",
      port: 3310,
      timeout: 60000,
      localFallback: true,
    },
  });

  const { isInfected, viruses } = await clamscan.isInfected(filePath);

  if (isInfected) {
    throw new Error(`File is infected: ${viruses.join(", ")}`);
  }
};

export default scanFile;
