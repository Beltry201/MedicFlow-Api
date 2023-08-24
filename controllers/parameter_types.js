import { ParameterType } from "../models/parameter_types.js"; // Import the model

export const createParameterType = async (req, res) => {
    try {
      const { parameter_type_name, category, _id_doctor, parameter_belongs_to } = req.body;
  
      // Create a new parameter type in the database
      const newParameterType = await ParameterType.create({
        parameter_type_name,
        category,
        _id_doctor,
        parameter_belongs_to,
      });
  
      res.status(201).json({ success: true, parameterType: newParameterType });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create parameter type', error: error.message });
    }
  };
  

export const getParameterType = async (req, res) => {
  try {
    const parameterType = await ParameterType.findByPk(req.params.id);

    if (!parameterType) {
      return res.status(404).json({ success: false, message: 'Parameter type not found' });
    }

    res.status(200).json({ success: true, parameterType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve parameter type', error: error.message });
  }
};

export const updateParameterType = async (req, res) => {
    try {
      const parameterType = await ParameterType.findByPk(req.params.id);
  
      if (!parameterType) {
        return res.status(404).json({ success: false, message: 'Parameter type not found' });
      }
  
      const { parameter_type_name, _id_subparameter, _id_doctor, parameter_belongs_to } = req.body;
  
      // Update parameter type attributes
      await parameterType.update({
        parameter_type_name,
        _id_subparameter,
        _id_doctor,
        parameter_belongs_to,
      });
  
      res.status(200).json({ success: true, parameterType });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update parameter type', error: error.message });
    }
  };
  

export const deleteParameterType = async (req, res) => {
  try {
    const parameterType = await ParameterType.findByPk(req.params.id);

    if (!parameterType) {
      return res.status(404).json({ success: false, message: 'Parameter type not found' });
    }

    // Delete the parameter type
    await parameterType.destroy();

    res.status(200).json({ success: true, message: 'Parameter type deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete parameter type', error: error.message });
  }
};
