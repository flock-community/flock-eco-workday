const path = "export/workday";

type ExportResponse = {
  link: string;
};
export function ExportClient() {
  const exportWorkday = async (code: string): Promise<ExportResponse> =>
    fetch(`${path}/${code}`, { method: "POST" }).then((result) =>
      result.json()
    );

  return { exportWorkday };
}
