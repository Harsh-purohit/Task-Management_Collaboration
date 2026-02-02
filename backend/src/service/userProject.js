import Projects from "../models/Projects.js";
import Tasks from "../models/Tasks.js";

export const fetchUserProjects = async (req) => {
  if (req.role === "admin") {
    return await Projects.find({}).lean();
  }

  const ownedProjects = await Projects.find({ userRef: req.userId }).lean();

  const tasks_projectID = await Tasks.find({ assignedTo: req.userId })
    .select("projectRef")
    .lean();

  const projectIds = tasks_projectID.map((t) => t.projectRef);

  const taskProjects = await Projects.find({
    _id: { $in: projectIds },
  }).lean();

  const allProjects = [
    ...ownedProjects,
    ...taskProjects.filter(
      (tp) => !ownedProjects.some((op) => op._id.equals(tp._id)),
    ),
  ];

  return allProjects;
};
