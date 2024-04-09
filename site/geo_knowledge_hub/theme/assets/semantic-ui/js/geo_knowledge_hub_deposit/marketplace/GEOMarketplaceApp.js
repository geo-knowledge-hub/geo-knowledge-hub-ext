/*
 * This file is part of GEO Knowledge Hub.
 * Copyright (C) 2021-2024 GEO Secretariat.
 *
 * GEO Knowledge Hub is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component, createRef, Fragment } from "react";
import PropTypes from "prop-types";

import _get from "lodash/get";
import _filter from "lodash/filter";
import _compact from "lodash/compact";

import { AccordionField, CustomFields } from "react-invenio-forms";
import {
  Card,
  Container,
  Grid,
  Ref,
  Sticky,
} from "semantic-ui-react";

import {
  AccessRightFieldResource,
  CommunityHeader,
  CreatibutorsField,
  DatesField,
  DeleteButton,
  DepositFormApp,
  DepositStatusBox,
  DescriptionsField,
  FileUploader,
  FormFeedback,
  IdentifiersField,
  LanguagesField,
  LicenseField,
  PreviewButton,
  PublicationDateField,
  PublishButton,
  PublisherField,
  RelatedWorksField,
  ResourceTypeField,
  SaveButton,
  SubjectsField,
  TitlesField,
  VersionField,
  FundingField,
} from "@geo-knowledge-hub/geo-deposit-react";

import {
  TargetAudienceField,
  EngagementPriorityField,
  WorkProgrammeActivityField,
} from "@geo-knowledge-hub/geo-components-react";

import { LocationsField } from "@geo-knowledge-hub/invenio-geographic-components-react";

import { i18next } from "@translations/invenio_app_rdm/i18next";

import { MarketplaceVendorContact, MarketplaceLaunch } from './components';

/**
 * Deposit Application for Marketplace Items.
 *
 * @note This component was adapted from ``Invenio App RDM`` (RDMDepositForm).
 */
export class GEOMarketplaceApp extends Component {
  constructor(props) {
    super(props);
    this.config = props.config || {};
    const { files, record } = this.props;

    // TODO: retrieve from backend
    this.config["canHaveMetadataOnlyRecords"] = true;

    // TODO: Make ALL vocabulary be generated by backend.
    // Currently, some vocabulary is generated by backend and some is
    // generated by frontend here. Iteration is faster and abstractions can be
    // discovered by generating vocabulary here. Once happy with vocabularies,
    // then we can generate it in the backend.
    this.vocabularies = {
      metadata: {
        ...this.config.vocabularies,

        creators: {
          ...this.config.vocabularies.creators,
          type: [
            { text: "Person", value: "personal" },
            { text: "Organization", value: "organizational" },
          ],
        },

        contributors: {
          ...this.config.vocabularies.contributors,
          type: [
            { text: "Person", value: "personal" },
            { text: "Organization", value: "organizational" },
          ],
        },
        identifiers: {
          ...this.config.vocabularies.identifiers,
        },
      },
    };

    // check if files are present
    this.noFiles = false;
    if (
      !Array.isArray(files.entries) ||
      (!files.entries.length && record.is_published)
    ) {
      this.noFiles = true;
    }
  }

  sidebarRef = createRef();
  formFeedbackRef = createRef();

  render() {
    const {
      record,
      files,
      permissions,
      preselectedCommunity,
    } = this.props;

    const customFieldsUI = this.config.custom_fields.ui;

    return (
      <DepositFormApp
        config={this.config}
        record={record}
        preselectedCommunity={preselectedCommunity}
        files={files}
        permissions={permissions}
      >
        <FormFeedback
          fieldPath="message"
          labels={this.config.custom_fields.error_labels}
        />
        <CommunityHeader imagePlaceholderLink="/static/images/square-placeholder.png" />

        <Container id="rdm-deposit-form" className="rel-mt-1">
          <Grid className="mt-25">
            <Grid.Column mobile={16} tablet={16} computer={11}>
              <AccordionField
                includesPaths={["files.enabled"]}
                active
                label={i18next.t("Files")}
              >
                {this.noFiles && record.is_published && (
                  <div className="text-align-center pb-10">
                    <em>{i18next.t("The record has no files.")}</em>
                  </div>
                )}
                <FileUploader
                  isDraftRecord={!record.is_published}
                  quota={this.config.quota}
                  decimalSizeDisplay={this.config.decimal_size_display}
                />
              </AccordionField>

              <AccordionField
                includesPaths={[
                  "metadata.title",
                  "metadata.publication_date",
                  "metadata.additional_titles",
                  "metadata.resource_type",
                  "metadata.marketplace.launch_url"
                ]}
                active
                label={i18next.t("Basic information")}
              >
                <Grid>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <TitlesField
                        options={this.vocabularies.metadata.titles}
                        fieldPath="metadata.title"
                        recordUI={record.ui}
                        required
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <ResourceTypeField
                        options={this.vocabularies.metadata.resource_type}
                        fieldPath="metadata.resource_type"
                        required
                      />

                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <PublicationDateField
                        required
                        fieldPath="metadata.publication_date"
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </AccordionField>

              <AccordionField
                includesPaths={[
                  "metadata.description",
                  "metadata.additional_descriptions",
                  "metadata.languages",
                ]}
                active
                label={i18next.t("Description and languages")}
              >
                <Grid>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <LanguagesField
                        fieldPath="metadata.languages"
                        initialOptions={_get(record, "ui.languages", []).filter(
                          (lang) => lang !== null
                        )} // needed because dumped empty record from backend gives [null]
                        serializeSuggestions={(suggestions) =>
                          suggestions.map((item) => ({
                            text: item.title_l10n,
                            value: item.id,
                            key: item.id,
                          }))
                        }
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <DescriptionsField
                        fieldPath="metadata.description"
                        options={this.vocabularies.metadata.descriptions}
                        recordUI={_get(record, "ui", null)}
                        editorConfig={{
                          removePlugins: [
                            "Image",
                            "ImageCaption",
                            "ImageStyle",
                            "ImageToolbar",
                            "ImageUpload",
                            "MediaEmbed",
                            "Table",
                            "TableToolbar",
                            "TableProperties",
                            "TableCellProperties",
                          ],
                        }}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.creators", "metadata.contributors", "metadata.marketplace.vendor_contact"]}
                active
                label={i18next.t("People / Company")}
              >
                <Grid columns={2} divided>
                  <Grid.Row>
                    <Grid.Column>
                      <CreatibutorsField
                        label={i18next.t("Creators")}
                        labelIcon="user"
                        fieldPath="metadata.creators"
                        roleOptions={this.vocabularies.metadata.creators.role}
                        schema="creators"
                        autocompleteNames={this.config.autocomplete_names}
                        required
                      />
                    </Grid.Column>

                    <Grid.Column>
                      <CreatibutorsField
                        addButtonLabel={i18next.t("Add contributor")}
                        label={i18next.t("Contributors")}
                        labelIcon="user plus"
                        fieldPath="metadata.contributors"
                        roleOptions={
                          this.vocabularies.metadata.contributors.role
                        }
                        schema="contributors"
                        autocompleteNames={this.config.autocomplete_names}
                        modal={{
                          addLabel: "Add contributor",
                          editLabel: "Edit contributor",
                        }}
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <MarketplaceVendorContact />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </AccordionField>

              <AccordionField
                includesPaths={[
                  "metadata.geo_work_programme_activity",
                  "metadata.engagement_priorities",
                  "metadata.target_audiences",
                  "metadata.subjects",
                ]}
                active
                label={i18next.t("Initiatives, audiences, and subjects")}
              >
                <Grid columns={2} divided>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <SubjectsField
                        fieldPath="metadata.subjects"
                        initialSuggestions={_filter(_get(record, "metadata.subjects", []))}
                        limitToOptions={this.vocabularies.metadata.subjects.limit_to}
                      />
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <WorkProgrammeActivityField
                        required={false}
                        initialSuggestions={
                          _compact([
                            _get(record, "ui.geo_work_programme_activity", null),
                          ]) || null
                        }
                      />
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row>
                    <Grid.Column>
                      <EngagementPriorityField
                        required={false}
                        initialSuggestions={_get(
                          record,
                          "ui.engagement_priorities",
                          null
                        )}
                      />
                    </Grid.Column>
                    <Grid.Column>
                      <TargetAudienceField
                        required={false}
                        initialSuggestions={_get(
                          record,
                          "ui.target_audiences",
                          null
                        )}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.version", "metadata.marketplace.launch_url"]}
                active
                label={i18next.t("Software information")}
              >
                <MarketplaceLaunch />
                <VersionField fieldPath="metadata.version" />
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.dates"]}
                active
                label={i18next.t("Dates")}
              >
                <DatesField
                  fieldPath="metadata.dates"
                  options={this.vocabularies.metadata.dates}
                  showEmptyValue
                />
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.locations"]}
                active
                label={i18next.t("Geographic locations")}
              >
                <LocationsField
                  label={"Locations"}
                  fieldPath={"metadata.locations.features"}
                />
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.publisher", "metadata.rights"]}
                active
                label={i18next.t("Publisher and licenses")}
              >
                <PublisherField fieldPath="metadata.publisher" />

                <LicenseField
                  fieldPath="metadata.rights"
                  searchConfig={{
                    searchApi: {
                      axios: {
                        headers: {
                          Accept: "application/vnd.inveniordm.v1+json",
                        },
                        url: "/api/vocabularies/licenses",
                        withCredentials: false,
                      },
                    },
                    initialQueryState: {
                      filters: [["tags", "recommended"]],
                    },
                  }}
                  serializeLicenses={(result) => ({
                    title: result.title_l10n,
                    description: result.description_l10n,
                    id: result.id,
                    link: result.props.url,
                  })}
                />
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.funding"]}
                active
                label={i18next.t("Funding")}
              >
                <FundingField
                  fieldPath="metadata.funding"
                  searchConfig={{
                    searchApi: {
                      axios: {
                        headers: {
                          Accept: "application/vnd.inveniordm.v1+json",
                        },
                        url: "/api/awards",
                        withCredentials: false,
                      },
                    },
                    initialQueryState: {
                      sortBy: "bestmatch",
                      sortOrder: "asc",
                      layout: "list",
                      page: 1,
                      size: 5,
                    },
                  }}
                  label="Awards"
                  labelIcon="money bill alternate outline"
                  deserializeAward={(award) => {
                    return {
                      title: award.title_l10n,
                      number: award.number,
                      funder: award.funder ?? "",
                      id: award.id,
                      ...(award.identifiers && {
                        identifiers: award.identifiers,
                      }),
                      ...(award.acronym && { acronym: award.acronym }),
                    };
                  }}
                  deserializeFunder={(funder) => {
                    return {
                      id: funder.id,
                      name: funder.name,
                      ...(funder.title_l10n && { title: funder.title_l10n }),
                      ...(funder.pid && { pid: funder.pid }),
                      ...(funder.country && { country: funder.country }),
                      ...(funder.identifiers && {
                        identifiers: funder.identifiers,
                      }),
                    };
                  }}
                  computeFundingContents={(funding) => {
                    let headerContent,
                      descriptionContent,
                      awardOrFunder = "";

                    if (funding.funder) {
                      const funderName =
                        funding.funder?.name ??
                        funding.funder?.title ??
                        funding.funder?.id ??
                        "";
                      awardOrFunder = "funder";
                      headerContent = funderName;
                      descriptionContent = "";

                      // there cannot be an award without a funder
                      if (funding.award) {
                        awardOrFunder = "award";
                        descriptionContent = funderName;
                        headerContent = funding.award.title;
                      }
                    }

                    return { headerContent, descriptionContent, awardOrFunder };
                  }}
                />
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.identifiers"]}
                active
                label={i18next.t("Alternate identifiers")}
              >
                <IdentifiersField
                  fieldPath="metadata.identifiers"
                  label={i18next.t("Alternate identifiers")}
                  labelIcon="barcode"
                  schemeOptions={this.vocabularies.metadata.identifiers.scheme}
                  showEmptyValue
                />
              </AccordionField>

              <AccordionField
                includesPaths={["metadata.related_identifiers"]}
                active
                label={i18next.t("Related links")}
              >
                <RelatedWorksField
                  fieldPath="metadata.related_identifiers"
                  options={this.vocabularies.metadata.identifiers}
                  label={i18next.t("Related links")}
                  labelIcon="linkify"
                  showEmptyValue
                />
              </AccordionField>
              <CustomFields
                config={customFieldsUI}
                templateLoader={(widget) =>
                  import(`@templates/custom_fields/${widget}.js`)
                }
                fieldPathPrefix="custom_fields"
              />
            </Grid.Column>
            <Ref innerRef={this.sidebarRef}>
              <Grid.Column
                mobile={16}
                tablet={16}
                computer={5}
                className="deposit-sidebar"
              >
                <Sticky context={this.sidebarRef} offset={20}>
                  <Card>
                    <Card.Content>
                      <DepositStatusBox />
                    </Card.Content>
                    <Card.Content>
                      <Grid relaxed>
                        <Grid.Column
                          computer={8}
                          mobile={16}
                          className="pb-0 left-btn-col"
                        >
                          <SaveButton fluid />
                        </Grid.Column>

                        <Grid.Column
                          computer={8}
                          mobile={16}
                          className="pb-0 right-btn-col"
                        >
                          <PreviewButton fluid />
                        </Grid.Column>

                        <Grid.Column width={16} className="pt-10">
                          <PublishButton
                            fluid
                          />
                        </Grid.Column>
                      </Grid>
                    </Card.Content>
                  </Card>

                  <AccessRightFieldResource
                    label={i18next.t("Visibility")}
                    labelIcon="shield"
                    fieldPath="access"
                    packageRecord={{ access: { record: "public", files: "public" } }}
                  />

                  {permissions?.can_delete_draft && (
                    <Card>
                      <Card.Content>
                        <DeleteButton
                          fluid
                          // TODO: make is_published part of the API response
                          //       so we don't have to do this
                          isPublished={record.is_published}
                        />
                      </Card.Content>
                    </Card>
                  )}
                </Sticky>
              </Grid.Column>
            </Ref>
          </Grid>
        </Container>
      </DepositFormApp>
    );
  }
}

GEOMarketplaceApp.propTypes = {
  config: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  preselectedCommunity: PropTypes.object,
  files: PropTypes.object,
  permissions: PropTypes.object,
};

GEOMarketplaceApp.defaultProps = {
  preselectedCommunity: undefined,
  permissions: null,
  files: null,
};
