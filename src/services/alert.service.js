const Alert = require('../models/Alert');
const User = require('../models/User');

const getUserAlerts = async (userId) => {
  return Alert.find({ user: userId }).sort({ createdAt: -1 });
};

const markAlertAsRead = async (alertId, userId) => {
  const alert = await Alert.findOne({ _id: alertId, user: userId, });

  if (!alert) {
    const error = new Error('Alerte introuvable.');
    error.statusCode = 404;
    throw error;
  }

  alert.read = true;
  await alert.save();

  return alert;
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
    return null;
  }

  let age = today.getFullYear() - birthDate.getFullYear();

  const birthdayNotReached = today.getMonth() < birthDate.getMonth() ||  (today.getMonth() === birthDate.getMonth() &&  today.getDate() < birthDate.getDate());

  if (birthdayNotReached) age--;
  return age;
};

const invalidMeasurement = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const checkMeasurement = async (userId, data) => {
  const { type, value, systolic, diastolic, mealTiming, } = data;

  const allowedTypes = [ 'blood_pressure', 'heart_rate', 'weight', 'blood_sugar', ];

  if (!allowedTypes.includes(type)) {
    return { alert: null };
  }

  const user = await User.findById(userId).select( 'dateOfBirth height gender' );

  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  const age = calculateAge(user.dateOfBirth);

  let alertData = null;

  //BLOOD PRESSURE

  if (type === 'blood_pressure') {
    // Technical input validation.
    if (
      !Number.isFinite(systolic) ||
      !Number.isFinite(diastolic) ||
      systolic < 40 ||
      systolic > 300 ||
      diastolic < 30 ||
      diastolic > 200 ||
      systolic <= diastolic
    ) {
      invalidMeasurement(
        'Valeurs de tension invalides. Vérifiez les nombres saisis et entrez une mesure correcte en mmHg.'
      );
    }

    if (age === null || age < 13) {
      return { alert: null };
    }

    const isAdolescent = age < 18;
    const isOlderAdult = age >= 65;
    const measurement = `${systolic}/${diastolic} mmHg`;

    if (systolic >= 180 || diastolic >= 120) {
      alertData = {
        title: 'Tension artérielle très élevée',
        message:
          `Votre mesure est de ${measurement}. ` +
          'Attendez au moins une minute puis reprenez votre tension. ' +
          'Si elle reste aussi élevée, contactez immédiatement un professionnel de santé. ' +
          'En cas de douleur thoracique, difficulté à respirer, faiblesse, engourdissement, ' +
          'trouble de la vision ou difficulté à parler, contactez les services d’urgence.',
        level: 'danger',
      };
    } else if (
      (isAdolescent && (systolic >= 140 || diastolic >= 90)) ||
      (!isAdolescent && (systolic >= 140 || diastolic >= 90))
    ) {
      alertData = {
        title: 'Tension artérielle élevée',
        message:
          `Votre mesure est de ${measurement}. ` +
          'Cette valeur se situe dans une plage élevée. ' +
          'Reprenez votre tension dans de bonnes conditions et demandez conseil ' +
          'à un professionnel de santé.',
        level: 'warning',
      };
    } else if (
      isAdolescent &&
      (systolic >= 130 || diastolic >= 80)
    ) {
      alertData = {
        title: 'Tension artérielle à surveiller',
        message:
          `Votre mesure est de ${measurement}. ` +
          'Cette valeur mérite une surveillance. Reprenez votre mesure ' +
          'et demandez conseil à un professionnel de santé si elle se répète.',
        level: 'warning',
      };
    } else if (systolic < 90 || diastolic < 60) {
      alertData = {
        title: 'Tension artérielle basse',
        message:
          `Votre mesure est de ${measurement}. ` +
          'Cette mesure est basse. Reprenez votre tension et demandez conseil ' +
          'à un professionnel de santé si elle reste basse. ' +
          'En cas de malaise ou d’évanouissement, demandez une assistance médicale urgente.',
        level: 'warning',
      };
    }

    if (alertData && isOlderAdult) {
      alertData.message +=
        ' Tenez également compte des vertiges, des chutes et des variations ' +
        'de tension en position debout. Demandez conseil à votre professionnel de santé.';
    }
  }

  //  HEART RATE

  else if (type === 'heart_rate') {
    
    if (!Number.isFinite(value) || value < 20 || value > 250) {
      invalidMeasurement(
        'Valeur de fréquence cardiaque invalide. Vérifiez la mesure saisie en bpm.'
      );
    }

    if (age === null || age < 13) {
      return { alert: null };
    }

    const lowThreshold = age < 18 ? 50 : 60;

    if (value < 40) {
      alertData = {
        title: ' Rythme cardiaque très bas',
        message:
          `Votre rythme cardiaque au repos est de ${value} bpm. ` +
          'Cette valeur est particulièrement basse. Vérifiez votre mesure ' +
          'et demandez rapidement un avis médical. En cas de malaise, ' +
          'difficulté à respirer ou douleur thoracique, contactez les urgences.',
        level: 'danger',
      };
    } else if (value < lowThreshold) {
      alertData = {
        title: 'Rythme cardiaque bas',
        message:
          `Votre rythme cardiaque au repos est de ${value} bpm. ` +
          'Cette valeur est basse par rapport au seuil de surveillance utilisé. ' +
          'Reprenez votre mesure et demandez conseil à un professionnel de santé, ' +
          'notamment si vous ressentez des symptômes.',
        level: 'warning',
      };
    } else if (value >= 130) {
      alertData = {
        title: ' Rythme cardiaque très élevé',
        message:
          `Votre rythme cardiaque au repos est de ${value} bpm. ` +
          'Reprenez la mesure après quelques minutes de repos. ' +
          'Si cette valeur persiste, demandez rapidement un avis médical.',
        level: 'danger',
      };
    } else if (value > 100) {
      alertData = {
        title: 'Rythme cardiaque élevé',
        message:
          `Votre rythme cardiaque au repos est de ${value} bpm. ` +
          'Assurez-vous d’être au repos pendant la mesure et vérifiez à nouveau. ' +
          'Si cette valeur persiste, demandez conseil à un professionnel de santé.',
        level: 'warning',
      };
    }
  }

  // WEIGHT

  else if (type === 'weight') {
    if (!Number.isFinite(value) || value < 2 || value > 300) {
      invalidMeasurement(
        'Poids invalide. Vérifiez la valeur saisie en kilogrammes.'
      );
    }

    // BMI categories for adults only.
    // Adolescents require age- and sex-specific growth references.
    if (age === null || age < 18) {
      return { alert: null };
    }

    const height = user.height;

    if (
      !Number.isFinite(height) ||
      height < 100 ||
      height > 250
    ) {
      return { alert: null };
    }

    const heightInMeters = height / 100;
    const bmi = value / (heightInMeters * heightInMeters);

    if (bmi >= 40) {
      alertData = {
        title: 'IMC très élevé',
        message:
          `Votre IMC calculé est de ${bmi.toFixed(1)}. ` +
          'Cette valeur se situe dans une catégorie élevée. ' +
          'Demandez conseil à un professionnel de santé pour une évaluation adaptée.',
        level: 'danger',
      };
    } else if (bmi >= 30) {
      alertData = {
        title: 'IMC élevé',
        message:
          `Votre IMC calculé est de ${bmi.toFixed(1)}. ` +
          'Cette valeur mérite une évaluation avec un professionnel de santé. ' +
          'L’IMC est un indicateur général et ne suffit pas à évaluer votre santé.',
        level: 'warning',
      };
    } else if (bmi < 18.5) {
      alertData = {
        title: 'IMC bas',
        message:
          `Votre IMC calculé est de ${bmi.toFixed(1)}. ` +
          'Cette valeur est inférieure à la plage habituelle chez l’adulte. ' +
          'Demandez conseil à un professionnel de santé.',
        level: 'warning',
      };
    }
  }

  // BLOOD GLUCOSE

  else if (type === 'blood_sugar') {
    if (!Number.isFinite(value) || value < 0.1 || value > 10) {
      invalidMeasurement(
        'Valeur de glycémie invalide. Vérifiez la valeur saisie en g/L.'
      );
    }

    if (!['fasting', 'after_meal'].includes(mealTiming)) {
      invalidMeasurement(
        'Veuillez préciser si la glycémie a été mesurée à jeun ou après le repas.'
      );
    }

    // These are screening alerts, not diagnostic criteria.
    if (value < 0.54) {
      alertData = {
        title: ' Glycémie très basse',
        message:
          `Votre glycémie est de ${value} g/L. ` +
          'Cette valeur est très basse. Prenez immédiatement les mesures ' +
          'appropriées indiquées par votre professionnel de santé. ' +
          'En cas de confusion, perte de connaissance ou impossibilité de vous alimenter, ' +
          'contactez les services d’urgence.',
        level: 'danger',
      };
    } else if (value < 0.70) {
      alertData = {
        title: 'Glycémie basse',
        message:
          `Votre glycémie est de ${value} g/L. ` +
          'Cette valeur est basse. Vérifiez votre mesure et suivez les recommandations ' +
          'de votre professionnel de santé.',
        level: 'warning',
      };
    } else if (mealTiming === 'fasting' && value >= 1.26) {
      alertData = {
        title: 'Glycémie à jeun élevée',
        message:
          `Votre glycémie à jeun est de ${value} g/L. ` +
          'Cette valeur dépasse le seuil de référence utilisé pour le dépistage. ' +
          'Un seul résultat ne permet pas de poser un diagnostic. ' +
          'Demandez conseil à un professionnel de santé pour effectuer les examens nécessaires.',
        level: 'warning',
      };
    } else if (mealTiming === 'fasting' && value >= 1.10) {
      alertData = {
        title: 'Glycémie à jeun à surveiller',
        message:
          `Votre glycémie à jeun est de ${value} g/L. ` +
          'Cette valeur mérite une surveillance. Reprenez votre mesure ' +
          'dans les conditions appropriées et demandez conseil à un professionnel de santé.',
        level: 'warning',
      };
    } else if (mealTiming === 'after_meal' && value >= 2.0) {
      alertData = {
        title: 'Glycémie élevée après repas',
        message:
          `Votre glycémie après repas est de ${value} g/L. ` +
          'L’interprétation dépend du temps écoulé depuis le repas. ' +
          'Reprenez votre mesure selon les recommandations de votre professionnel de santé ' +
          'et demandez conseil si cette valeur se répète.',
        level: 'warning',
      };
    }
  }

  if (!alertData) {  return { alert: null }; }

  // Prevent duplicate unread alerts within 30 minutes.
  const duplicateWindow = new Date(
    Date.now() - 30 * 60 * 1000
  );

  const existingAlert = await Alert.findOne({ user: userId, title: alertData.title, level: alertData.level, read: false, createdAt: { $gte: duplicateWindow }, });

  if (existingAlert) {
    return { alert: existingAlert, duplicate: true, };
  }

  const alert = await Alert.create({
    user: userId,
    ...alertData,
  });

  return { alert, duplicate: false };
};

module.exports = { getUserAlerts, markAlertAsRead, checkMeasurement,};
