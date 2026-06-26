import prisma from "../../config/prisma";
import { ApplicationStatus } from "@prisma/client";
import { VALID_TRANSITIONS } from "../../utils/workflow";
import { createAuditLog } from "../audit/audit.service";
import { AppError } from "../../errors/AppError";
import { ApplicationFilters } from "./application.types";

export const createApplication = async (
  fullName: string,
  email: string,
  tenantId: string,
  createdById: string
) => {
  return prisma.application.create({
    data: {
      fullName,
      email,
      tenantId,
      createdById,
    },
  });
};

export const getAllApplications = async (
  tenantId: string,
  filters: ApplicationFilters
) => {
  const {
    page,
    limit,
    status,
    reviewerId,
    search,
  } = filters;

  const skip = (page - 1) * limit;

  const whereClause: any = {
    tenantId,
  };

  if (status) {
    whereClause.status = status;
  }

if (reviewerId) {
    whereClause.reviewerId = reviewerId;
}

if (search) {

    whereClause.OR = [

        {
            fullName: {
                contains: search,
                mode: "insensitive",
            },
        },

        {
            email: {
                contains: search,
                mode: "insensitive",
            },
        },

    ];
  }
  
  const applications =
await prisma.application.findMany({

    where: whereClause,

    skip,

    take: limit,

    include: {

        reviewer: true,

        createdBy: true,

    },

    orderBy: {

        createdAt: "desc",

    },

});

  const total =
await prisma.application.count({

    where: whereClause,

});

  const totalPages =
Math.ceil(total / limit);

  return {

    applications,

    meta: {

        page,

        limit,

        total,

        totalPages,

    },

};
};

export const getApplicationById = async (
  id: string,
  tenantId: string
) => {
  return prisma.application.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      createdBy: true,
    },
  });
};

export const submitApplication = async (
  applicationId: string,
  tenantId: string
) => {

  const application =
    await prisma.application.findFirst({
      where: {
        id: applicationId,
        tenantId,
      },
    });

  if (!application) {
    throw new AppError(
    "Application not found",
    404
);
  }

  const allowedTransitions =
    VALID_TRANSITIONS[
      application.status
    ];

  if (
    !allowedTransitions.includes(
      ApplicationStatus.SUBMITTED
    )
  ) {
    throw new AppError(
      `Cannot move from ${application.status} to SUBMITTED`,
      400
    );
  }

  return prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status:
        ApplicationStatus.SUBMITTED,
    },
  });
};

export const updateApplicationStatus = async (
  applicationId: string,
  tenantId: string,
  userId: string,
  newStatus: ApplicationStatus
) => {

  
  const application =
  await prisma.application.findFirst({
    where: {
      id: applicationId,
      tenantId,
    },
  });
  
  if (!application) {
    throw new AppError(
    "Application not found",
    404
);
  }

  const oldStatus = application.status;

  const allowedTransitions =
    VALID_TRANSITIONS[
      application.status
    ];

  if (
    !allowedTransitions.includes(newStatus)
  ) {
    throw new AppError(
      `Cannot move from ${application.status} to ${newStatus}`,
      400
    );
  }

  const updatedApplication =
  await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: newStatus,
    },
  });

  await createAuditLog(
  application.id,
  userId,
  oldStatus,
  newStatus
);

  return updatedApplication;
};

export const assignReviewer = async (
    applicationId: string,
    reviewerId: string,
    tenantId: string
) => {
    console.log("Application ID:", applicationId);
    console.log("Tenant ID:", tenantId);
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            tenantId
        }
    });
    console.log(application);
    if (!application) {
        throw new AppError("Application not found", 404);
    }

    if (application.status !== "SUBMITTED") {
    throw new AppError(
        "Only submitted applications can be assigned to a reviewer",
        400
    );
}

    const reviewer = await prisma.user.findFirst({
        where: {
            id: reviewerId,
            tenantId,
            role: "REVIEWER"
        }
    });

    if (!reviewer) {
        throw new AppError(
    "Reviewer not found",
    404
);
    }

    return prisma.application.update({
  where: {
    id: applicationId,
  },
  data: {
    reviewerId,
  },
  include: {
    reviewer: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  },
});
};

export const getMyApplications = async (
    reviewerId: string,
    tenantId: string,
    filters: ApplicationFilters
) => {
  const {
    page,
    limit,
    status,
    search,
} = filters;

  const skip = (page - 1) * limit;

  const whereClause: any = {

    tenantId,

    reviewerId,

};

  if (status) {
    whereClause.status = status;
}

  if (search) {

    whereClause.OR = [

        {
            fullName: {
                contains: search,
                mode: "insensitive",
            },
        },

        {
            email: {
                contains: search,
                mode: "insensitive",
            },
        },

    ];

}

  const applications =
await prisma.application.findMany({

    where: whereClause,

    skip,

    take: limit,

    include: {
      createdBy: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    }
    },

    orderBy: {

        createdAt: "desc",

    },

});

  const total =
await prisma.application.count({

    where: whereClause,

});

return {

    applications,

    meta: {

        page,

        limit,

        total,

        totalPages:
            Math.ceil(total / limit),

    },
  };
}

export const getApplicationMetrics = async (
    tenantId: string
) => {
  const total = await prisma.application.count({
    where: {
        tenantId,
    },
});

  const draft = await prisma.application.count({
    where: {
        tenantId,
        status: "DRAFT",
    },
});

  const submitted = await prisma.application.count({
    where: {
        tenantId,
        status: "SUBMITTED",
    },
});

const documentVerification =
await prisma.application.count({
    where: {
        tenantId,
        status: "DOCUMENT_VERIFICATION",
    },
});

const riskAssessment =
await prisma.application.count({
    where: {
        tenantId,
        status: "RISK_ASSESSMENT",
    },
});

const manualReview =
await prisma.application.count({
    where: {
        tenantId,
        status: "MANUAL_REVIEW",
    },
});

const approved =
await prisma.application.count({
    where: {
        tenantId,
        status: "APPROVED",
    },
});

const rejected =
await prisma.application.count({
    where: {
        tenantId,
        status: "REJECTED",
    },
});

  return {
    total,
    draft,
    submitted,
    documentVerification,
    riskAssessment,
    manualReview,
    approved,
    rejected,
};

// const grouped =
// await prisma.application.groupBy({
//     by: ["status"],
//     where: {
//         tenantId,
//     },
//     _count: {
//         status: true,
//     },
// });
};

export const calculateRisk = async (
    applicationId: string,
    tenantId: string
) => {

  const application =
await prisma.application.findFirst({

    where: {
        id: applicationId,
        tenantId,
    },

    include: {
        documents: true,
    },

});

  if (!application) {
    throw new AppError(
        "Application not found",
        404
    );
}

  let riskScore = 0;

const reasons: string[] = [];

  const pan =
application.documents.find(
    doc => doc.type === "PAN"
);

if (pan) {

    riskScore += 20;
    reasons.push("PAN uploaded");

    if (pan.verified) {
        riskScore += 20;
        reasons.push("PAN verified");
    }
}

  const aadhaar =
application.documents.find(
    doc => doc.type === "AADHAAR"
);

if (aadhaar) {

    riskScore += 20;
    reasons.push("AADHAAR uploaded");

    if (aadhaar.verified) {
        riskScore += 20;
        reasons.push("AADHAAR verified");
    }
}

  const passport =
application.documents.find(
    doc => doc.type === "PASSPORT"
);

if (passport) {
    riskScore += 10;
    reasons.push("Passport uploaded");
}

  if (application.reviewerId) {
    riskScore += 10;
    reasons.push("Reviewer assigned");
}
  if (
    application.status ===
    "MANUAL_REVIEW"
) {
    riskScore += 10;
    reasons.push("Application reached manual review");
}

  const unverifiedDocs =
application.documents.filter(
    doc => !doc.verified
);

if (unverifiedDocs.length > 0) {

    riskScore -= 10;

    reasons.push(
        `${unverifiedDocs.length} document(s) pending verification`
    );

}

  let riskLevel;

if (riskScore >= 80) {
    riskLevel = "LOW";
}
else if (riskScore >= 50) {
    riskLevel = "MEDIUM";
}
else {
    riskLevel = "HIGH";
}
  
  return {
    riskScore,
    riskLevel,
    reasons,
};
};