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

    reviewer: {
        select: {
            id: true,
            name: true,
            email: true
        }
    },

    documents: {
        select: {
            id: true,
            type: true,
            verified: true,
            uploadedAt: true
        }
    }

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

  let trustScore = 0;

  let decision:
    | "APPROVED"
    | "MANUAL_REVIEW"
    | "REJECT";

  const reasons: string[] = [];

  const pan =
application.documents.find(
    doc => doc.type === "PAN"
);

if (pan) {

    trustScore += 5;
    reasons.push("PAN uploaded");

    if (pan.verified) {
        trustScore += 20;
        reasons.push("PAN verified");
    } else {
        trustScore -= 15;
        reasons.push("PAN pending verification");
    }

} else {

    trustScore -= 30;
    reasons.push("Mandatory PAN missing");

}

  const aadhaar =
application.documents.find(
    doc => doc.type === "AADHAAR"
);

if (aadhaar) {

    trustScore += 5;
    reasons.push("AADHAAR uploaded");

    if (aadhaar.verified) {
        trustScore += 20;
        reasons.push("AADHAAR verified");
    } else {
        trustScore -= 15;
        reasons.push("AADHAAR pending verification");
    }

} else {

    trustScore -= 30;
    reasons.push("Mandatory AADHAAR missing");

}

  const passport =
application.documents.find(
    doc => doc.type === "PASSPORT"
);

if (passport) {

    trustScore += 5;
    reasons.push("Passport uploaded");

    if (passport.verified) {
        trustScore += 15;
        reasons.push("Passport verified");
    }

}

  const bankStatement =
application.documents.find(
    doc => doc.type === "BANK_STATEMENT"
);

if (bankStatement) {

    trustScore += 5;
    reasons.push("Bank statement uploaded");

    if (bankStatement.verified) {
        trustScore += 10;
        reasons.push("Bank statement verified");
    }

}

  if (application.reviewerId) {
    trustScore += 10;
    reasons.push("Reviewer assigned");
}
  if (
    application.status ===
    "DOCUMENT_VERIFICATION"
) {

    trustScore += 10;

    reasons.push(
        "Passed submission stage"
    );

}

if (
    application.status ===
    "MANUAL_REVIEW"
) {

    trustScore += 5;

    reasons.push(
        "Reached manual review stage"
    );

}

  if (trustScore >= 85) {

    decision = "APPROVED";

}
else if (trustScore >= 60) {

    decision = "MANUAL_REVIEW";

}
else {

    decision = "REJECT";

}
  
  return {
    trustScore,
    decision,
    reasons,
};
};

export const getApplicationAuditLogs = async (
    applicationId: string,
    tenantId: string
) => {

    return prisma.auditLog.findMany({

        where: {
            applicationId,
            application: {
                tenantId
            }
        },

        include: {
            performedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }

    });

};

export const getMe = async (
    userId: string
) => {

    return prisma.user.findUnique({

        where: {
            id: userId
        },

        select: {
            id: true,
            name: true,
            email: true,
            role: true,

            tenant: {
                select: {
                    id: true,
                    name: true
                }
            }
        }

    });

};