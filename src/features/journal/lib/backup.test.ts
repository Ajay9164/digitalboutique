import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  createProject,
  deleteProject,
  exportBackup,
  importBackup,
  listProjects,
  updateProject,
} from "@/features/journal/lib/backup";
import {
  createEmptyProjectInput,
  EMPTY_LEARNING,
} from "@/features/journal/lib/project";

describe("journal IndexedDB CRUD + backup", () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  it("creates, updates, deletes, and lists projects", async () => {
    const created = await createProject({
      ...createEmptyProjectInput(),
      name: "Silk blouse",
      observations: "Bias cut",
    });
    expect(created.id).toBeTruthy();

    const updated = await updateProject(created.id, {
      ...createEmptyProjectInput(),
      name: "Silk blouse v2",
      observations: "Bias cut + lining",
      learningProgress: {
        ...EMPTY_LEARNING,
        percentComplete: 40,
      },
    });
    expect(updated.name).toBe("Silk blouse v2");
    expect(updated.learningProgress.percentComplete).toBe(40);

    const listed = await listProjects();
    expect(listed).toHaveLength(1);

    await deleteProject(created.id);
    expect(await listProjects()).toHaveLength(0);
  });

  it("exports and merges backups", async () => {
    await createProject({ ...createEmptyProjectInput(), name: "A" });
    const backup = await exportBackup();
    expect(backup.app).toBe("tailor");
    expect(backup.version).toBe(1);
    expect(backup.projects).toHaveLength(1);

    await db.projects.clear();
    const result = await importBackup(backup, "merge");
    expect(result.imported).toBe(1);
    expect((await listProjects())[0]?.name).toBe("A");
  });

  it("replace mode clears existing projects", async () => {
    await createProject({ ...createEmptyProjectInput(), name: "Old" });
    const backup = await exportBackup();
    await createProject({ ...createEmptyProjectInput(), name: "Extra" });
    expect(await listProjects()).toHaveLength(2);

    await importBackup(backup, "replace");
    const listed = await listProjects();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.name).toBe("Old");
  });

  it("rejects invalid backup files", async () => {
    await expect(importBackup({ hello: true })).rejects.toThrow(/not a Tailor/i);
  });
});
