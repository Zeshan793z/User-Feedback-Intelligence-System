import Team from "../models/Team";
import { sendEmail } from "../services/emailService";

export const setTeamEmail = async (req: any, res: any) => {
  try {
    const { category, email } = req.body;
    
    let team = await Team.findOne({ category });
    
    if (team) {
      team.email = email;
      await team.save();
    } else {
      team = await Team.create({ category, email });
    }
    
    res.json({ message: "Team email updated", team });
  } catch (error) {
    res.status(500).json({ message: "Failed to set team email" });
  }
};

export const getTeamEmails = async (req: any, res: any) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};