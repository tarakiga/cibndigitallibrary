---
title: Content Management (CMS)
description: Managing site content via the Admin Settings CMS and how it powers public pages.
---

# Content Management (CMS)

## Overview
The Admin Settings CMS provides a demo content management experience via localStorage. It includes sections for:
- Pages
- Library
- Courses
- Resources (Contact, FAQs, etc.)
- Membership (plans displayed on the homepage)

Data keys (localStorage):
- cms_pages
- cms_library
- cms_courses
- cms_resources (includes membership array)

## Membership Plans
- Location in Admin: Left sidebar, under Resources (dedicated "Membership" item)
- Field schema per plan: { name, price, period, description, color, features[] (Included), exclusions[] (Not Included), popular:boolean, restricted:boolean }
- UI Resiliency:
  - Missing color -> neutral gradient applied
  - Missing icon -> chosen automatically based on name
  - No CMS data -> default static plans are displayed
- Rendering:
  - Included features display with a green check icon
  - Not Included display as struck-through, dimmed text
- Admin workflows:
  - Add/Edit: Use the Membership tab in Admin Settings to define plan details
  - Reorder: Drag-and-drop or up/down controls (depending on implementation)
  - Delete: Remove plans to hide them from the homepage

## Library & Courses
- Rich forms for adding, inline editing, bulk delete, search/filtering, image previews, and reordering.
- Public pages read and render items with client-side search, filters, pagination, favorites, and cart integration.

## Persistence and Caveats
- All CMS data is persisted in localStorage only and will not sync across browsers or devices.
- Consider integrating a backend API for real persistence and multi-user editing.