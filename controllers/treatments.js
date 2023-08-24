export const createTreatment = async (req, res) => {
  try {
    const { name, price, duration_weeks, description, _id_doctor } = req.body;

    // Create a new treatment in the database
    const newTreatment = await Treatment.create({
      name,
      price,
      duration_weeks,
      description,
      _id_doctor,
    });

    res.status(201).json({ success: true, treatment: newTreatment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create treatment', error: error.message });
  }
};

export const deleteTreatment = async (req, res) => {
  try {
    const treatmentId = req.params.id;

    // Find the treatment by ID
    const treatment = await Treatment.findByPk(treatmentId);

    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    // Delete the treatment from the database
    await treatment.destroy();

    res.status(200).json({ success: true, message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete treatment', error: error.message });
  }
};

export const updateTreatment = async (req, res) => {
  try {
    const treatmentId = req.params.id;
    const { name, price, duration_weeks, description, _id_doctor } = req.body;

    // Find the treatment by ID
    const treatment = await Treatment.findByPk(treatmentId);

    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    // Update the treatment in the database
    await treatment.update({
      name,
      price,
      duration_weeks,
      description,
      _id_doctor,
    });

    res.status(200).json({ success: true, message: 'Treatment updated successfully', treatment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update treatment', error: error.message });
  }
};

export const getTreatmentDetails = async (req, res) => {
  try {
    const treatmentId = req.params.id;

    // Find the treatment by ID
    const treatment = await Treatment.findByPk(treatmentId);

    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    res.status(200).json({ success: true, treatment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get treatment details', error: error.message });
  }
};

export const listTreatments = async (req, res) => {
  try {
    // Retrieve all treatments from the database
    const treatments = await Treatment.findAll();

    res.status(200).json({ success: true, treatments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve treatments', error: error.message });
  }
};

export const getDoctorTreatments = async (req, res) => {
    try {
      const doctorId = req.params._id_doctor; // Assuming you are passing the doctor's ID as a URL parameter (e.g., /treatments/doctor/:doctorId)
  
      // Find all treatments for the given doctor ID
      const treatments = await Treatment.findAll({
        where: {
          _id_doctor: doctorId,
        },
      });
  
      if (treatments.length === 0) {
        return res.status(404).json({ success: false, message: 'No treatments found for this doctor' });
      }
  
      res.status(200).json({ success: true, treatments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get doctor treatments', error: error.message });
    }
  };