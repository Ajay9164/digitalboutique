import { db, type JournalBackup, type JournalProject } from "@/lib/db";
import { createId, type ProjectInput } from "@/features/journal/lib/project";

function reviveProject(
  raw: JournalBackup["projects"][number] | JournalProject,
): JournalProject {
  return {
    ...raw,
    date: new Date(raw.date),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    fabricPhoto: raw.fabricPhoto ?? null,
    draftImage: raw.draftImage ?? null,
    measurements: raw.measurements ?? {},
    alterationNotes: raw.alterationNotes ?? "",
    observations: raw.observations ?? "",
    learningProgress: {
      measurementsLearned: raw.learningProgress?.measurementsLearned ?? [],
      constructionSteps: raw.learningProgress?.constructionSteps ?? [],
      practiceCompletions: raw.learningProgress?.practiceCompletions ?? 0,
      percentComplete: raw.learningProgress?.percentComplete ?? 0,
      notes: raw.learningProgress?.notes ?? "",
    },
  };
}

export async function listProjects(): Promise<JournalProject[]> {
  const rows = await db.projects.orderBy("updatedAt").reverse().toArray();
  return rows.map(reviveProject);
}

export async function getProject(id: string): Promise<JournalProject | undefined> {
  const row = await db.projects.get(id);
  return row ? reviveProject(row) : undefined;
}

export async function createProject(input: ProjectInput): Promise<JournalProject> {
  const now = new Date();
  const project: JournalProject = {
    id: createId(),
    name: input.name.trim() || "Untitled project",
    date: input.date,
    fabricPhoto: input.fabricPhoto,
    measurements: input.measurements,
    draftImage: input.draftImage,
    patternType: input.patternType,
    alterationNotes: input.alterationNotes,
    observations: input.observations,
    learningProgress: input.learningProgress,
    createdAt: now,
    updatedAt: now,
  };
  await db.projects.put(project);
  return project;
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<JournalProject> {
  const existing = await db.projects.get(id);
  if (!existing) throw new Error("Project not found.");

  const project: JournalProject = {
    ...existing,
    name: input.name.trim() || "Untitled project",
    date: input.date,
    fabricPhoto: input.fabricPhoto,
    measurements: input.measurements,
    draftImage: input.draftImage,
    patternType: input.patternType,
    alterationNotes: input.alterationNotes,
    observations: input.observations,
    learningProgress: input.learningProgress,
    updatedAt: new Date(),
  };
  await db.projects.put(project);
  return reviveProject(project);
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function exportBackup(): Promise<JournalBackup> {
  const projects = await listProjects();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "tailor",
    projects: projects.map((project) => ({
      ...project,
      date: new Date(project.date).toISOString(),
      createdAt: new Date(project.createdAt).toISOString(),
      updatedAt: new Date(project.updatedAt).toISOString(),
    })),
  };
}

export function downloadBackupJson(backup: JournalBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tailor-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Restore all projects from a backup JSON.
 * Replaces existing projects with the same id; keeps others.
 */
export async function importBackup(
  raw: unknown,
  mode: "merge" | "replace" = "merge",
): Promise<{ imported: number }> {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid backup file.");
  }

  const data = raw as Partial<JournalBackup>;
  if (data.app !== "tailor" || data.version !== 1 || !Array.isArray(data.projects)) {
    throw new Error("This file is not a Tailor journal backup (v1).");
  }

  const revived = data.projects.map((project) => reviveProject(project));

  if (mode === "replace") {
    await db.projects.clear();
  }

  await db.projects.bulkPut(revived);
  return { imported: revived.length };
}

export async function readBackupFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text) as unknown;
}
