import { useResults } from "@keybr/result";
import { Button, Field, FieldList, Icon } from "@keybr/widget";
import { mdiDeleteForever, mdiDownload, mdiUpload } from "@mdi/js";
import { useIntl } from "react-intl";
import { parseTypingData, selectNewResults } from "./importdata.ts";

export function FooterSection() {
  const { formatMessage } = useIntl();
  const { handleDownloadData, handleImportData, handleResetData } =
    useCommands();

  return (
    <FieldList>
      <Field>
        <Button
          size={16}
          icon={<Icon shape={mdiDownload} />}
          label={formatMessage({
            id: "t_Download_data",
            defaultMessage: "Download data",
          })}
          title={formatMessage({
            id: "profile.download.description",
            defaultMessage: "Download all your typing data in JSON format.",
          })}
          onClick={() => {
            handleDownloadData();
          }}
        />
      </Field>
      <Field>
        <Button
          size={16}
          icon={<Icon shape={mdiUpload} />}
          label="Import data"
          title="Restore typing data from a JSON file saved with Download data."
          onClick={() => {
            handleImportData();
          }}
        />
      </Field>
      <Field.Filler />
      <Field>
        <Button
          size={16}
          icon={<Icon shape={mdiDeleteForever} />}
          label={formatMessage({
            id: "t_Reset_statistics",
            defaultMessage: "Reset statistics",
          })}
          title={formatMessage({
            id: "profile.reset.description",
            defaultMessage:
              "Permanently delete all of your typing data and reset statistics.",
          })}
          onClick={() => {
            handleResetData();
          }}
        />
      </Field>
    </FieldList>
  );
}

function useCommands() {
  const { formatMessage } = useIntl();
  const { results, appendResults, clearResults } = useResults();
  return {
    handleDownloadData: () => {
      const json = JSON.stringify(results);
      const blob = new Blob([json], { type: "application/json" });
      download(blob, "typing-data.json");
    },
    handleImportData: () => {
      pickFile(async (file) => {
        let imported;
        try {
          imported = parseTypingData(await file.text());
        } catch (err) {
          window.alert(`Could not read ${file.name}: ${String(err)}`);
          return;
        }
        const { added, skipped } = selectNewResults(results, imported);
        if (added.length > 0) {
          appendResults(added);
        }
        window.alert(
          `Imported ${added.length} result(s) from ${file.name}.` +
            (skipped > 0
              ? ` Skipped ${skipped} that were duplicates or older than ` +
                `your latest local result (reset statistics first to ` +
                `restore a full history).`
              : ""),
        );
      });
    },
    handleResetData: () => {
      const message = formatMessage({
        id: "profile.reset.message",
        defaultMessage:
          "Are you sure you want to delete all data and reset your profile? " +
          "This operation is permanent and cannot be undone!",
      });
      if (window.confirm(message)) {
        clearResults();
      }
    },
  };
}

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.setAttribute("href", URL.createObjectURL(blob));
  a.setAttribute("download", name);
  a.setAttribute("hidden", "");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function pickFile(callback: (file: File) => void) {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "application/json,.json");
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file != null) {
      callback(file);
    }
  });
  input.click();
}
